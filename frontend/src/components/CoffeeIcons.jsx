import React from 'react'
import {
  CoffeeCup,
  Search,
  MapPin,
  Star,
  StarSolid,
  ArrowUpRight,
  Check,
  Xmark,
  BadgeCheck,
  Filter,
  Clock,
  Phone,
  Wifi,
  Building,
  OpenInWindow,
  Copy,
  ShieldCheck,
  User,
  Leaf,
  NavArrowDown,
  Flash,
  OpenBook,
} from 'iconoir-react'

/**
 * CoffeeIcons — Clean, essential icon layer (18 icons)
 *
 * Essential icons untuk coffee shop discovery:
 * - Brand: CoffeeCup
 * - Navigation: Search, MapPin, ArrowUpRight, External
 * - Action: Check, Close, Copy
 * - Status: VerifiedSeal, Shield, Filter
 * - Details: Clock, Phone, Wifi, Building
 * - Attributes: User, Bean
 *
 * Semua dari Iconoir line style, strokeWidth 1.5, color-driven.
 * NO DUPLICATES. Only what's actually used.
 */

const ICON_STROKE = 1.5

function make(Component) {
  return function CoffeeIcon({ size = 18, className = '', ...props }) {
    return (
      <Component
        width={size}
        height={size}
        strokeWidth={ICON_STROKE}
        className={`iconoir ${className}`}
        aria-hidden="true"
        {...props}
      />
    )
  }
}

// ========================================================================
// 18 ESSENTIAL ICONS ONLY (used in codebase)
// ========================================================================

/* Brand & Identity */
export const CoffeeCupIcon = make(CoffeeCup)

/* Navigation & Discovery */
export const SearchIcon = make(Search)
export const LocationIcon = make(MapPin)
export const ExternalIcon = make(OpenInWindow)
export const ArrowUpRightIcon = make(ArrowUpRight)

/* Actions */
export const CheckIcon = make(Check)
export const CloseIcon = make(Xmark)
export const CopyIcon = make(Copy)

/* Status & Verification */
export const VerifiedSealIcon = make(BadgeCheck)
export const ShieldIcon = make(ShieldCheck)

/* Filters & Organization */
export const FilterIcon = make(Filter)
export const ChevronDownIcon = make(NavArrowDown)

/* Shop Details & Facilities */
export const ClockIcon = make(Clock)
export const PhoneIcon = make(Phone)
export const WifiIcon = make(Wifi)
export const BuildingIcon = make(Building)
export const FlashIcon = make(Flash)
export const BookOpenIcon = make(OpenBook)

/* User & Attributes */
export const UserIcon = make(User)
export const BeanIcon = make(Leaf)

/* Ratings */
export const StarIcon = make(Star)
export const StarFilledIcon = make(StarSolid)


