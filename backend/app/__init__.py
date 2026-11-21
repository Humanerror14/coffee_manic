"""Aplikasi Flask Coffee Manic — application factory."""
from flask import Flask, jsonify
from flask_jwt_extended.exceptions import JWTExtendedException
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.exceptions import HTTPException

from app.api.routes import admin, auth, catalog, community, health, taxonomy
from app.config import get_config
from app.extensions import cors, db, jwt, migrate
from app.rate_limiter import init_rate_limiter


def create_app(config_name: str | None = None):
    app = Flask(__name__)
    app.config.from_object(get_config(config_name))

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    init_rate_limiter(app)

    _register_blueprints(app)
    _register_error_handlers(app)
    _register_cli(app)

    return app


def _register_blueprints(app: Flask):
    api_prefix = "/api"
    app.register_blueprint(health.bp, url_prefix=api_prefix)
    app.register_blueprint(auth.bp, url_prefix=api_prefix)
    app.register_blueprint(catalog.bp, url_prefix=api_prefix)
    app.register_blueprint(taxonomy.bp, url_prefix=api_prefix)
    app.register_blueprint(community.bp, url_prefix=api_prefix)
    app.register_blueprint(admin.bp, url_prefix=api_prefix)


def _register_error_handlers(app: Flask):
    @app.errorhandler(HTTPException)
    def handle_http_error(e):
        return (
            jsonify(
                {
                    "error": {
                        "message": e.description,
                        "status": e.code,
                    }
                }
            ),
            e.code,
        )

    @app.errorhandler(JWTExtendedException)
    def handle_jwt_error(e):
        return jsonify({"error": {"message": "Token tidak valid atau kedaluwarsa."}}), 401

    @app.errorhandler(SQLAlchemyError)
    def handle_db_error(e):
        app.logger.exception("Database error")
        return jsonify({"error": {"message": "Terjadi kesalahan pada server."}}), 500

    @app.errorhandler(Exception)
    def handle_generic_error(e):
        app.logger.exception("Unhandled error")
        return jsonify({"error": {"message": "Terjadi kesalahan pada server."}}), 500


def _register_cli(app: Flask):
    @app.cli.command("seed")
    def seed_command():
        """Isi database dengan data contoh (mock berlabel) dan admin dev."""
        from app.seed import run_seed

        with app.app_context():
            run_seed()
        print("Seed selesai.")
