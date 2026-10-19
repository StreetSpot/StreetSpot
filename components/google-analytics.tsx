import Script from "next/script"

export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) return null
  const config = `window.dataLayer = window.dataLayer || []; window.gtag = function(){window.dataLayer.push(arguments)}; window.gtag('js', new Date()); window.gtag('config', '${measurementId}', { anonymize_ip: true });`
  return <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
    <Script id="streetspot-ga4" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: config }} />
  </>
}
