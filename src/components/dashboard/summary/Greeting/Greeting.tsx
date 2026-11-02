import styles from '../../../../styles/components/dashboard/summary/Greeting.module.css'

interface GreetingProps {
  firstName: string
}

export function Greeting({ firstName }: GreetingProps) {
  return <h1 className={styles.greeting}>Good evening, {firstName}</h1>
}
