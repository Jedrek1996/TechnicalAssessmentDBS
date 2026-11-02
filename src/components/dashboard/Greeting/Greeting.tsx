import styles from '../../../styles/components/dashboard/Greeting.module.css'

interface GreetingProps {
  firstName: string
}

/** Worded exactly as the brief says; it doesn't change with the time of day. */
export function Greeting({ firstName }: GreetingProps) {
  return <h1 className={styles.greeting}>Good evening, {firstName}</h1>
}
