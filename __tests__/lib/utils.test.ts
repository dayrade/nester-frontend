import {
  cn,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatNumber,
  isValidEmail,
  isValidUrl,
  extractDomain,
  detectListingPlatform,
  generateId,
  slugify,
  truncateText,
  calculateReadingTime,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  formatFileSize,
  getFileExtension,
  isImageFile,
  stringToColor,
  getInitials,
  sleep,
  retry
} from '@/lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000')
      expect(formatCurrency(1500.99)).toBe('$1,501')
      expect(formatCurrency(1000, 'EUR')).toBe('€1,000')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-12-25')
      expect(formatDate(date)).toBe('Dec 25, 2023')
      expect(formatDate('2023-12-25')).toBe('Dec 25, 2023')
    })

    it('should accept custom options', () => {
      const date = new Date('2023-12-25')
      expect(formatDate(date, { month: 'long' })).toBe('December 25, 2023')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2023-12-25T12:00:00Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return "Just now" for recent times', () => {
      const now = new Date('2023-12-25T12:00:00Z')
      const recent = new Date('2023-12-25T11:59:30Z')
      expect(formatRelativeTime(recent)).toBe('Just now')
    })

    it('should format minutes correctly', () => {
      const fiveMinutesAgo = new Date('2023-12-25T11:55:00Z')
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')
    })

    it('should format hours correctly', () => {
      const twoHoursAgo = new Date('2023-12-25T10:00:00Z')
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago')
    })

    it('should format days correctly', () => {
      const threeDaysAgo = new Date('2023-12-22T12:00:00Z')
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with abbreviations', () => {
      expect(formatNumber(500)).toBe('500')
      expect(formatNumber(1500)).toBe('1.5K')
      expect(formatNumber(1500000)).toBe('1.5M')
      expect(formatNumber(1500000000)).toBe('1.5B')
    })
  })

  describe('isValidEmail', () => {
    it('should validate email addresses correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('should validate URLs correctly', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('ftp://files.example.com')).toBe(true)
      expect(isValidUrl('invalid-url')).toBe(false)
      expect(isValidUrl('just-text')).toBe(false)
    })
  })

  describe('extractDomain', () => {
    it('should extract domain from URL', () => {
      expect(extractDomain('https://www.example.com/path')).toBe('www.example.com')
      expect(extractDomain('http://subdomain.example.org')).toBe('subdomain.example.org')
      expect(extractDomain('invalid-url')).toBe(null)
    })
  })

  describe('detectListingPlatform', () => {
    it('should detect known platforms', () => {
      expect(detectListingPlatform('https://www.zillow.com/property')).toBe('zillow')
      expect(detectListingPlatform('https://www.realtor.com/listing')).toBe('realtor')
      expect(detectListingPlatform('https://www.redfin.com/home')).toBe('redfin')
      expect(detectListingPlatform('https://unknown-platform.com')).toBe('other')
      expect(detectListingPlatform('invalid-url')).toBe(null)
    })
  })

  describe('generateId', () => {
    it('should generate ID of correct length', () => {
      expect(generateId()).toHaveLength(8)
      expect(generateId(12)).toHaveLength(12)
    })

    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Special Characters!@#')).toBe('special-characters')
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces')
      expect(slugify('Under_scores and-dashes')).toBe('under-scores-and-dashes')
    })
  })

  describe('truncateText', () => {
    it('should truncate text correctly', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(truncateText(longText, 20)).toBe('This is a very long...')
      expect(truncateText('Short text', 20)).toBe('Short text')
    })
  })

  describe('calculateReadingTime', () => {
    it('should calculate reading time correctly', () => {
      const shortText = 'This is a short text with few words.'
      const longText = Array(300).fill('word').join(' ')
      
      expect(calculateReadingTime(shortText)).toBe(1)
      expect(calculateReadingTime(longText)).toBe(2)
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should debounce function calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')

      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg3')
    })
  })

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should throttle function calls', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('arg1')
      throttledFn('arg2')
      throttledFn('arg3')

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg1')

      jest.advanceTimersByTime(100)
      throttledFn('arg4')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenCalledWith('arg4')
    })
  })

  describe('deepClone', () => {
    it('should deep clone objects', () => {
      const original = {
        name: 'John',
        address: { city: 'New York', zip: '10001' },
        hobbies: ['reading', 'swimming']
      }
      
      const cloned = deepClone(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.address).not.toBe(original.address)
      expect(cloned.hobbies).not.toBe(original.hobbies)
    })

    it('should handle primitive values', () => {
      expect(deepClone(42)).toBe(42)
      expect(deepClone('string')).toBe('string')
      expect(deepClone(null)).toBe(null)
    })

    it('should handle dates', () => {
      const date = new Date('2023-12-25')
      const cloned = deepClone(date)
      
      expect(cloned).toEqual(date)
      expect(cloned).not.toBe(date)
    })
  })

  describe('isEmpty', () => {
    it('should check if values are empty', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty({})).toBe(true)
      expect(isEmpty(new Map())).toBe(true)
      expect(isEmpty(new Set())).toBe(true)
      
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty('text')).toBe(false)
      expect(isEmpty({ key: 'value' })).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })

  describe('getFileExtension', () => {
    it('should extract file extensions', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf')
      expect(getFileExtension('image.jpg')).toBe('jpg')
      expect(getFileExtension('file.name.with.dots.txt')).toBe('txt')
      expect(getFileExtension('no-extension')).toBe('')
    })
  })

  describe('isImageFile', () => {
    it('should identify image files', () => {
      expect(isImageFile('photo.jpg')).toBe(true)
      expect(isImageFile('image.PNG')).toBe(true)
      expect(isImageFile('graphic.svg')).toBe(true)
      expect(isImageFile('document.pdf')).toBe(false)
      expect(isImageFile('script.js')).toBe(false)
    })
  })

  describe('stringToColor', () => {
    it('should generate consistent colors for same strings', () => {
      const color1 = stringToColor('test')
      const color2 = stringToColor('test')
      expect(color1).toBe(color2)
    })

    it('should generate different colors for different strings', () => {
      const color1 = stringToColor('test1')
      const color2 = stringToColor('test2')
      expect(color1).not.toBe(color2)
    })

    it('should return HSL color format', () => {
      const color = stringToColor('test')
      expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
    })
  })

  describe('getInitials', () => {
    it('should extract initials from names', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Mary Jane Watson')).toBe('MJ')
      expect(getInitials('SingleName')).toBe('S')
      expect(getInitials('a b c d e')).toBe('AB')
    })
  })

  describe('sleep', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should resolve after specified time', async () => {
      const promise = sleep(1000)
      jest.advanceTimersByTime(1000)
      await expect(promise).resolves.toBeUndefined()
    })
  })

  describe('retry', () => {
    it('should retry failed operations', async () => {
      let attempts = 0
      const mockFn = jest.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          throw new Error('Failed')
        }
        return 'Success'
      })

      const result = await retry(mockFn, 3, 0)
      expect(result).toBe('Success')
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('should throw error after max attempts', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'))
      
      await expect(retry(mockFn, 2, 0)).rejects.toThrow('Always fails')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })
})