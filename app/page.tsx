export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: 'white',
      }}>Adam Porter</h1>
      <h2 style={{
        fontSize: '24px',
        color: 'white',
      }}>Software Engineer</h2>
      <p>I&apos;m a software engineer with a passion for building products that help people live better lives.</p>
      <p>I&apos;m currently working at <a href="https://www.google.com">Google</a> as a software engineer.</p>
    </div>
  )
}