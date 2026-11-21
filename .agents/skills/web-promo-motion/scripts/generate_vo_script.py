#!/usr/bin/env python3
"""
generate_vo_script.py
Menghasilkan naskah Voice Over (VO), Cue Sheet, dan file Subtitle (.srt / .vtt)
untuk video promosi web Coffee Manic (dan web lainnya).
"""

import argparse
import json
import sys

SCRIPTS = {
    "15s": [
        {
            "start": "00:00:00,000",
            "end": "00:00:03,500",
            "speaker": "Voice Over",
            "text": "Lagi nyari tempat ngopi yang asyik di Lhoksukon?",
            "visual": "Hero zoom cangkir kopi mengepul, logo Coffee Manic menyala halus."
        },
        {
            "start": "00:00:03,500",
            "end": "00:00:10,000",
            "speaker": "Voice Over",
            "text": "Buka Coffee Manic! Cek warkop dengan Wi-Fi kencang, stopkontak melimpah, dan foto riil terverifikasi.",
            "visual": "Peralihan filter instan fasilitas, showcase kartu kedai Canden Kupi & Aceh Kopi."
        },
        {
            "start": "00:00:10,000",
            "end": "00:00:15,000",
            "speaker": "Voice Over",
            "text": "Tinggal klik, petunjuk arah langsung terbuka. Jelajahi warkop favoritmu di Coffee Manic!",
            "visual": "Klik tombol rute peta Google Maps, brand outro logo & URL coffeemanic.local."
        }
    ],
    "30s": [
        {
            "start": "00:00:00,000",
            "end": "00:00:04,500",
            "speaker": "Voice Over",
            "text": "Di Lhoksukon ada puluhan kedai kopi... tapi mana yang paling pas buat kebutuhanmu hari ini?",
            "visual": "Typo kinetik tebal 'CARI WARKOP PAS?', peta siluet Kecamatan Lhoksukon."
        },
        {
            "start": "00:00:04,500",
            "end": "00:00:09,500",
            "speaker": "Voice Over",
            "text": "Pernah ke warkop tapi colokan penuh, Wi-Fi lambat, atau suasananya terlalu bising?",
            "visual": "Ilustrasi kebutuhan: nugas fokus vs nongkrong santai, ikon friksi melayang."
        },
        {
            "start": "00:00:09,500",
            "end": "00:00:18,000",
            "speaker": "Voice Over",
            "text": "Tenang! Kini ada Coffee Manic. Panduan direktori kedai kopi lokal terkurasi lengkap di Lhoksukon.",
            "visual": "Reveal antarmuka web Coffee Manic, spotlight kartu kedai beranimasi, cover foto nyata."
        },
        {
            "start": "00:00:18,000",
            "end": "00:00:24,500",
            "speaker": "Voice Over",
            "text": "Filter fasilitas sesukamu, lihat dokumentasi foto asli suasana, dan cek ulasan jujur komunitas.",
            "visual": "Bottom sheet filter mobile meluncur mulus, toggle Wi-Fi, galeri foto grid."
        },
        {
            "start": "00:00:24,500",
            "end": "00:00:30,000",
            "speaker": "Voice Over",
            "text": "Kunjungi Coffee Manic sekarang di coffeemanic.local, dan temukan sudut ngopi ternyamanmu!",
            "visual": "Badge kurator terverifikasi, logo Coffee Manic anggun, CTA 'Kunjungi Sekarang'."
        }
    ]
}

def to_srt(cues):
    lines = []
    for idx, cue in enumerate(cues, 1):
        lines.append(str(idx))
        lines.append(f"{cue['start']} --> {cue['end']}")
        lines.append(cue['text'])
        lines.append("")
    return "\n".join(lines)

def to_cue_sheet(cues):
    output = ["# CUE SHEET PRODUKSI MOTION & VOICE OVER\n"]
    for idx, cue in enumerate(cues, 1):
        output.append(f"### Adegan {idx} [{cue['start'][:8]} - {cue['end'][:8]}]")
        output.append(f"- **Visual**: {cue['visual']}")
        output.append(f"- **Voice Over**: \"{cue['text']}\"\n")
    return "\n".join(output)

def main():
    parser = argparse.ArgumentParser(description="Generator Script VO & Motion Promo")
    parser.add_argument("--duration", choices=["15s", "30s"], default="30s", help="Durasi video promosi")
    parser.add_argument("--format", choices=["text", "srt", "cuesheet"], default="cuesheet", help="Format output")
    args = parser.parse_args()

    cues = SCRIPTS.get(args.duration, SCRIPTS["30s"])

    if args.format == "srt":
        print(to_srt(cues))
    elif args.format == "cuesheet":
        print(to_cue_sheet(cues))
    else:
        for c in cues:
            print(f"[{c['start'][:8]}] {c['text']}")

if __name__ == "__main__":
    main()
