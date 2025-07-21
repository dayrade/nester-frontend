'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface RoomTypeSelectorProps {
  value?: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
  label?: string
  placeholder?: string
}

// Room type categories as specified in requirements
const ROOM_TYPES = {
  interior: [
    { value: 'living-room', label: 'Living Room' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'dining-room', label: 'Dining Room' },
    { value: 'hallway-entryway', label: 'Hallway / Entryway' },
    { value: 'closet-walk-in-closet', label: 'Closet / Walk-in Closet' },
    { value: 'laundry-utility-room', label: 'Laundry Room / Utility Room' },
    { value: 'pantry', label: 'Pantry' },
    { value: 'staircase-landing', label: 'Staircase / Landing' }
  ],
  exterior: [
    { value: 'garden', label: 'Garden' },
    { value: 'backyard', label: 'Backyard' },
    { value: 'front-yard', label: 'Front Yard' },
    { value: 'balcony', label: 'Balcony' },
    { value: 'patio-terrace', label: 'Patio / Terrace' },
    { value: 'deck', label: 'Deck' },
    { value: 'pool-area', label: 'Pool Area' },
    { value: 'driveway', label: 'Driveway' },
    { value: 'garage-interior', label: 'Garage (Interior view)' },
    { value: 'garden-shed-outbuilding', label: 'Garden with Shed / Outbuilding' },
    { value: 'rooftop-garden', label: 'Rooftop / Rooftop Garden' },
    { value: 'courtyard', label: 'Courtyard' },
    { value: 'veranda-porch', label: 'Veranda / Porch' },
    { value: 'outdoor-kitchen-bbq', label: 'Outdoor Kitchen / BBQ Area' }
  ],
  specialty: [
    { value: 'home-office', label: 'Home Office' },
    { value: 'study-library', label: 'Study / Library' },
    { value: 'home-gym-fitness', label: 'Home Gym / Fitness Room' },
    { value: 'sauna-steam-room', label: 'Sauna / Steam Room' },
    { value: 'home-theater-cinema', label: 'Home Theater / Cinema Room' },
    { value: 'wine-cellar', label: 'Wine Cellar' },
    { value: 'mudroom', label: 'Mudroom' },
    { value: 'playroom-kids-room', label: 'Playroom / Kids\' Room' },
    { value: 'nursery', label: 'Nursery' },
    { value: 'game-entertainment-room', label: 'Game Room / Entertainment Room' },
    { value: 'man-cave-she-shed', label: 'Man Cave / She Shed' },
    { value: 'meditation-prayer-room', label: 'Meditation Room / Prayer Room' },
    { value: 'music-recording-studio', label: 'Music Room / Recording Studio' },
    { value: 'hobby-craft-room', label: 'Hobby / Craft Room' },
    { value: 'art-studio', label: 'Art Studio' },
    { value: 'indoor-pool-room', label: 'Indoor Pool Room' },
    { value: 'guest-room', label: 'Guest Room' },
    { value: 'in-law-suite', label: 'In-law Suite' },
    { value: 'attic-finished', label: 'Attic (Finished)' },
    { value: 'basement-finished-unfinished', label: 'Basement (Finished or Unfinished)' },
    { value: 'sunroom-conservatory', label: 'Sunroom / Conservatory' },
    { value: 'dressing-vanity-room', label: 'Dressing Room / Vanity Room' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'storage-room', label: 'Storage Room' },
    { value: 'safe-panic-room', label: 'Safe Room / Panic Room' },
    { value: 'utility-boiler-room', label: 'Utility Boiler Room' }
  ]
}

export default function RoomTypeSelector({
  value,
  onChange,
  required = false,
  className = '',
  label = 'Room Type',
  placeholder = 'Select room type...'
}: RoomTypeSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {/* Common Interior Rooms */}
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            🔹 Common Interior Rooms
          </div>
          {ROOM_TYPES.interior.map((room) => (
            <SelectItem key={room.value} value={room.value}>
              {room.label}
            </SelectItem>
          ))}
          
          {/* Separator */}
          <div className="border-t border-gray-200 my-1" />
          
          {/* Exterior Spaces */}
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            🔸 Exterior Spaces
          </div>
          {ROOM_TYPES.exterior.map((room) => (
            <SelectItem key={room.value} value={room.value}>
              {room.label}
            </SelectItem>
          ))}
          
          {/* Separator */}
          <div className="border-t border-gray-200 my-1" />
          
          {/* Specialty & Rare Rooms */}
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            🔻 Specialty & Rare
          </div>
          {ROOM_TYPES.specialty.map((room) => (
            <SelectItem key={room.value} value={room.value}>
              {room.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Export room types for use in other components
export { ROOM_TYPES }
export type { RoomTypeSelectorProps }