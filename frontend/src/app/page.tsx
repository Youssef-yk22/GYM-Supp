'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-indigo-600">
        <div className="absolute inset-0">
          
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Fuel Your Fitness Journey
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            Premium supplements to help you achieve your fitness goals. From protein powders to pre-workouts, we&apos;ve got everything you need.
          </p>
          <div className="mt-10">
            <button
              onClick={() => router.push('/Products')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-12">Featured Categories</h2>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {[
            { 
              name: 'Protein Powders', 
              image: 'https://www.theevolveway.com/cdn/shop/files/strawberrytart_d4c0f823-3019-4d35-83cf-1348cad16596.jpg?v=1697641398',
              description: 'High-quality protein supplements for muscle growth and recovery',
              path: '/Products'
            },
            { 
              name: 'Pre-Workouts', 
              image: 'https://www.theevolveway.com/cdn/shop/files/PreCola.jpg?v=1717159248&width=1946',
              description: 'Energy-boosting supplements to enhance your workout performance',
              path: '/Products'
            },
            { 
              name: 'Creatine', 
              image: 'https://www.theevolveway.com/cdn/shop/files/Creatine-1.jpg?v=1696386274',
              description: 'Essential amino acids for muscle recovery and endurance',
              path: '/Products'
            },
          ].map((category) => (
            <div key={category.name} className="group relative">
              <div className="relative w-full h-80 rounded-lg overflow-hidden group-hover:opacity-75">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover object-center"
                />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {category.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {category.description}
              </p>
              <button
                onClick={() => router.push(category.path)}
                className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all {category.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Why Choose Us?
              </h2>
              <p className="mt-3 text-lg text-gray-500">
                We&apos;re committed to providing the highest quality supplements to help you reach your fitness goals.
              </p>
            </div>
            <div className="mt-12 lg:mt-0">
              <dl className="space-y-10">
                {[
                  {
                    name: 'Premium Quality',
                    description: 'All our products are made with the highest quality ingredients and are third-party tested.',
                  },
                  {
                    name: 'Fast Shipping',
                    description: 'Get your supplements delivered to your doorstep within 2-3 business days.',
                  },
                  {
                    name: 'Expert Support',
                    description: 'Our team of fitness experts is here to help you choose the right products.',
                  },
                ].map((feature) => (
                  <div key={feature.name} className="relative">
                    <dt>
                      <p className="text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start your fitness journey?</span>
            <span className="block">Start shopping now.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Join thousands of satisfied customers who have achieved their fitness goals with our supplements.
          </p>
          <button
            onClick={() => router.push('/Products')}
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            Browse Products
          </button>
        </div>
      </div>
    </div>
  );
}
