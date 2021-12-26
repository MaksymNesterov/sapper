import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
       <Component {...pageProps} />
       <style jsx global>
         {`
           body {
             font-family: 'Roboto', sans-serif;
           }
         `}
        </style>
    </>
  ) 
}

export default MyApp
