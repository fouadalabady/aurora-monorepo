interface Props {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'ar' }
  ]
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  
  return {
    title: 'Test Page',
    description: 'Test Description',
    alternates: {
      languages: {
        en: '/en',
        ar: '/ar'
      }
    }
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">Locale: {locale}</p>
      <button className="px-4 py-2 bg-blue-500 text-white rounded">Test Button</button>
    </div>
  )
}