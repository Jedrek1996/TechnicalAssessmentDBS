import type { Ref } from 'react'
import styles from '../../../styles/components/common/SearchInput.module.css'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  ref?: Ref<HTMLInputElement>
}

export function SearchInput({ value, onChange, onClear, ref }: SearchInputProps) {
  return (
    <div className={styles.wrap}>
      <input
        ref={ref}
        type="search"
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Search transactions"
        placeholder="Search transactions"
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
