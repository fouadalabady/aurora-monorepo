import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@workspace/ui';

import { Star, Phone, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { locales } from '../../i18n';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'homepage' });
  
  return {
    title: t('hero.title'), 
    description: t('hero.subtitle'),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const isRTL = locale === 'ar';

  // Mock data for services
  const services = [
    {
      id: 1,
      title: locale === 'ar' ? 'خدمات التكييف والتبريد' : 'HVAC Services',
      description: locale === 'ar' 
        ? 'تركيب وصيانة وإصلاح أنظمة التكييف والتبريد'
        : 'Installation, maintenance, and repair of heating and cooling systems',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20HVAC%20technician%20working%20on%20air%20conditioning%20unit%2C%20modern%20clean%20style&image_size=landscape_4_3',
      features: locale === 'ar' 
        ? ['تركيب احترافي', 'صيانة دورية', 'إصلاح سريع', 'ضمان الجودة']
        : ['Professional Installation', 'Regular Maintenance', 'Quick Repairs', 'Quality Guarantee']
    },
    {
      id: 2,
      title: locale === 'ar' ? 'الخدمات الكهربائية' : 'Electrical Services',
      description: locale === 'ar'
        ? 'أعمال كهربائية آمنة ومعتمدة لجميع الاحتياجات'
        : 'Safe and certified electrical work for all your needs',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20electrician%20working%20with%20electrical%20panel%2C%20safety%20equipment%2C%20modern%20style&image_size=landscape_4_3',
      features: locale === 'ar'
        ? ['تركيب آمن', 'فحص دوري', 'إصلاح عاجل', 'شهادة معتمدة']
        : ['Safe Installation', 'Regular Inspection', 'Emergency Repairs', 'Certified Work']
    },
    {
      id: 3,
      title: locale === 'ar' ? 'خدمات السباكة' : 'Plumbing Services',
      description: locale === 'ar'
        ? 'حلول سباكة شاملة للمنازل والمكاتب'
        : 'Comprehensive plumbing solutions for homes and offices',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20plumber%20fixing%20pipes%2C%20clean%20modern%20bathroom%20setting&image_size=landscape_4_3',
      features: locale === 'ar'
        ? ['إصلاح التسريبات', 'تنظيف المجاري', 'تركيب الأدوات', 'خدمة طوارئ']
        : ['Leak Repairs', 'Drain Cleaning', 'Fixture Installation', 'Emergency Service']
    }
  ];

  // Mock testimonials
  const testimonials = [
    {
      id: 1,
      name: locale === 'ar' ? 'أحمد محمد' : 'Ahmed Mohammed',
      rating: 5,
      comment: locale === 'ar'
        ? 'خدمة ممتازة وسريعة. فريق محترف جداً وأسعار معقولة.'
        : 'Excellent and fast service. Very professional team and reasonable prices.',
      service: locale === 'ar' ? 'خدمات التكييف' : 'HVAC Services',
      date: '2024-12-15'
    },
    {
      id: 2,
      name: locale === 'ar' ? 'فاطمة علي' : 'Fatima Ali',
      rating: 5,
      comment: locale === 'ar'
        ? 'حل مشكلة الكهرباء بسرعة وكفاءة. أنصح بهم بشدة.'
        : 'Solved the electrical problem quickly and efficiently. Highly recommend.',
      service: locale === 'ar' ? 'الخدمات الكهربائية' : 'Electrical Services',
      date: '2024-12-10'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              <Badge variant="secondary" className="w-fit">
                {t('homepage.hero.trustBadge')}
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {t('homepage.hero.title')}
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                {t('homepage.hero.subtitle')}
              </p>
              <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <Button size="lg" className="aurora-button">
                  {t('homepage.hero.cta')}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180 mr-2' : 'ml-2'}`} />
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  {t('homepage.hero.ctaSecondary')}
                </Button>
              </div>
              <div className={`flex items-center gap-6 pt-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">+966 50 123 4567</span>
                </div>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Clock className="w-5 h-5" />
                  <span>{locale === 'ar' ? '24/7 متاح' : '24/7 Available'}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20service%20team%20working%20on%20home%20maintenance%2C%20modern%20clean%20style%2C%20high%20quality&image_size=square_hd"
                alt={t('homepage.hero.title')}
                width={600}
                height={600}
                className="rounded-lg shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {t('homepage.services.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('homepage.services.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {services.map((service) => (
              <Card key={service.id} className="service-card">
                <div className="relative h-48 mb-4">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardHeader>
                  <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
                    {service.title}
                  </CardTitle>
                  <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {service.features.map((feature, index) => (
                      <li key={index} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full aurora-button">
                    {t('services.getQuote')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link href={`/${locale}/services`}>
              <Button variant="outline" size="lg">
                {t('homepage.services.viewAll')}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180 mr-2' : 'ml-2'}`} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className={`text-center mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {t('homepage.testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('homepage.testimonials.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="testimonial-card">
                <CardContent className="pt-6">
                  <div className={`flex items-center gap-1 mb-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className={`text-gray-700 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {testimonial.comment}
                  </p>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.service}</p>
                    </div>
                    <Badge variant="secondary">
                      {t('testimonials.verified')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link href={`/${locale}/testimonials`}>
              <Button variant="outline" size="lg">
                {t('homepage.testimonials.viewAll')}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180 mr-2' : 'ml-2'}`} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    
      <section className="bg-primary text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('homepage.cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('homepage.cta.subtitle')}
          </p>
          <div className={`flex gap-4 justify-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Link href={`/${locale}/contact`}>
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                {t('homepage.cta.button')}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180 mr-2' : 'ml-2'}`} />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Phone className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('navigation.callNow')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}