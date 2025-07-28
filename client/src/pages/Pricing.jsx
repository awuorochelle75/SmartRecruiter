import React, { useState, useEffect, useRef } from "react";
import { Check, X, ArrowRight, DollarSign, Zap, Users, Briefcase } from "lucide-react"; // Added icons for pricing features
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "./Footer";


// Animation Wrapper with Intersection Observer
const AnimatedOnScroll = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Pricing Plan Data - Reduced Features
const pricingPlans = [
  {
    name: "Starter",
    price: "KSh 2,500",
    period: "/month",
    description: "Ideal for small teams or individual recruiters getting started.",
    features: [
      { text: "Up to 5 active assessments", included: true },
      { text: "Basic analytics dashboard", included: true },
      { text: "Standard question library", included: true },
      { text: "Email support", included: true },
      { text: "Candidate management (up to 50 candidates)", included: true },
      { text: "Custom branding", included: false },
    ],
    buttonText: "Get Started",
    buttonVariant: "default",
  },
  {
    name: "Professional",
    price: "KSh 7,500",
    period: "/month",
    description: "Perfect for growing businesses needing advanced assessment tools.",
    features: [
      { text: "Unlimited active assessments", included: true },
      { text: "Advanced analytics & reporting", included: true },
      { text: "Custom question creation", included: true },
      { text: "Priority email & chat support", included: true },
      { text: "Unlimited candidate management", included: true },
      { text: "Full custom branding & white-labeling", included: true },
    ],
    buttonText: "Choose Plan",
    buttonVariant: "default",
    highlight: true, // To highlight this plan
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored solutions for large organizations with complex hiring needs.",
    features: [
      { text: "Unlimited active assessments", included: true },
      { text: "Comprehensive analytics suite", included: true },
      { text: "Custom question creation & AI generation", included: true },
      { text: "24/7 Phone & dedicated support", included: true },
      { text: "Full custom branding & white-labeling", included: true },
      { text: "Advanced API access & custom integrations", included: true },
      { text: "Dedicated account manager & onboarding", included: true },
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
  },
];

// FAQ Data
const faqData = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express) and M-Pesa for our Kenyan customers. Bank transfers are available for Enterprise plans.",
  },
  {
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes will be prorated.",
  },
  {
    question: "Do you offer a free trial?",
    answer: "We offer a 14-day free trial for the Professional plan, no credit card required. This allows you to explore all features.",
  },
  {
    question: "Is there a discount for annual billing?",
    answer: "Yes, we offer a significant discount (typically 20%) when you choose annual billing for our Starter and Professional plans.",
  },
];

const Pricing = () => {
  return (
    <div className="bg-white text-gray-900 min-h-screen dark:bg-gray-900 dark:text-white">
      {/* Navbar - Made fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Hero Section - Added pt-24 to account for fixed navbar height */}
      <section className="relative pt-24 pb-24 md:pt-32 md:pb-32 text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6">
          <AnimatedOnScroll>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">
              Simple, Transparent Pricing
            </h1>
          </AnimatedOnScroll>
          <AnimatedOnScroll delay={100}>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto dark:text-gray-300">
              Find the perfect plan to streamline your recruitment process, whether you're a startup or a large enterprise.
            </p>
          </AnimatedOnScroll>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section className="py-20 md:py-28 bg-gray-100 dark:bg-gray-950">
        <div className="container mx-auto px-6">
          <AnimatedOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">Choose Your Plan</h2>
          </AnimatedOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan, index) => (
              <AnimatedOnScroll key={plan.name} delay={index * 150}>
                <Card className={`h-full flex flex-col rounded-xl shadow-lg transition-all duration-300 ${
                  plan.highlight 
                    ? "border-4 border-blue-500 bg-white dark:bg-gray-800 transform scale-105" 
                    : "border border-gray-200 bg-white dark:bg-gray-800"
                }`}>
                  <CardHeader className="text-center pb-4">
                    <CardTitle className={`text-3xl font-bold mb-2 ${plan.highlight ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col items-center justify-center py-6">
                    <p className="text-5xl font-extrabold text-gray-900 dark:text-white">
                      {plan.price}
                      <span className="text-xl font-medium text-gray-500 dark:text-gray-400">{plan.period}</span>
                    </p>
                    <ul className="mt-8 space-y-4 text-left w-full max-w-xs mx-auto">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                          )}
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-6 flex justify-center">
                    <Button 
                      variant={plan.buttonVariant} 
                      className={`w-full py-3 text-lg rounded-md ${
                        plan.highlight 
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md dark:bg-blue-500 dark:hover:bg-blue-600" 
                          : "bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600"
                      }`}
                    >
                      {plan.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </AnimatedOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <AnimatedOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </AnimatedOnScroll>
          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <AnimatedOnScroll key={index} delay={index * 100}>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{faq.question}</h3>
                  <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                </div>
              </AnimatedOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section (Reused from About.jsx for consistency) */}
      <section className="py-20 md:py-24 bg-blue-600 dark:bg-blue-800 text-white text-center">
        <div className="container mx-auto px-6">
          <AnimatedOnScroll>
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Ready to Build Your Dream Team?</h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                    Stop searching, start discovering. Join the future of recruitment and unlock the potential of your next great hire.
                </p>
                <Button variant="outline" className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-blue-400 dark:hover:bg-gray-700 rounded-md px-8 py-3 text-lg font-semibold shadow-lg">
                    Get Started Now
                </Button>
            </div>
          </AnimatedOnScroll>
      </div>
      </section>

      {/* Footer (Imported from components/Footer.jsx) */}
      <Footer />
    </div>
  );
};

export default Pricing;
