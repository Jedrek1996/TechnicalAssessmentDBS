import type { Ref } from 'react'
import styles from '../../../styles/components/common/SearchInput.module.css'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  label?: string
  fullWidth?: boolean
  ref?: Ref<HTMLInputElement>
}

export function SearchInput({
  value,
  onChange,
  onClear,
  label = 'Search transactions',
  fullWidth = false,
  ref,
}: SearchInputProps) {
  return (
    <div className={fullWidth ? `${styles.wrap} ${styles.full}` : styles.wrap}>
      <input
        ref={ref}
        type="search"
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        placeholder={label}
      />
      {value && (
        <button
          type="button"
          className={styles.clear}
          aria-label="Clear text"
          onClick={onClear}
        >
          ×
        </button>
      )}
    </div>
  )
}
