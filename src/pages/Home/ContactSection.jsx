import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { httpClient } from '../../services/api';

// Validation schema
const contactSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  subject: yup
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .required('Subject is required'),
  message: yup
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .required('Message is required'),
});

const ContactSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(contactSchema),
  });

  const watchedMessage = watch('message');

  // Contact form submission mutation
  const contactMutation = useMutation({
    mutationFn: async contactData => {
      // Submit contact form to backend
      const response = await httpClient.post('/contact', contactData);
      return response;
    },
    onSuccess: data => {
      setIsSubmitted(true);
      reset();
      toast.success(
        "Message sent successfully! We'll get back to you within 24 hours."
      );

      // Reset success state after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    },
    onError: error => {
      console.error('Contact form submission failed:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to send message. Please try again or contact us directly.'
      );
    },
  });

  const onSubmit = async data => {
    // Add additional metadata
    const formData = {
      ...data,
      timestamp: new Date().toISOString(),
      source: 'homepage_contact_form',
      userAgent: navigator.userAgent,
    };

    contactMutation.mutate(formData);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'hello@upskill.co.za',
      description: 'Send us an email anytime',
      action: 'mailto:hello@upskill.co.za',
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+27 (0) 11 123-4567',
      description: 'Mon-Fri from 9am to 5pm SAST',
      action: 'tel:+27111234567',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: 'Johannesburg, SA',
      description: '123 Tech Street, Sandton',
      action: 'https://maps.google.com',
    },
    {
      icon: Clock,
      title: 'Office Hours',
      content: '9:00 AM - 5:00 PM',
      description: 'Monday through Friday (SAST)',
      action: null,
    },
  ];

  const features = [
    {
      icon: MessageSquare,
      title: '24/7 Support',
      description: 'Get help whenever you need it',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built by developers, for developers',
    },
    {
      icon: Award,
      title: 'Trusted Platform',
      description: 'Verified skills and endorsements',
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Get in Touch
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Have questions about UpSkill? Want to join our community or need
            support? We&apos;d love to hear from you. Reach out and let&apos;s
            connect!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <h3 className="mb-6 text-2xl font-semibold text-gray-900">
                Send us a Message
              </h3>

              {/* Success Message */}
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 flex items-center space-x-3 rounded-lg border border-green-200 bg-green-50 p-4"
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Message sent successfully!
                    </p>
                    <p className="text-sm text-green-600">
                      We&apos;ll get back to you within 24 hours.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {contactMutation.isError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">
                      Failed to send message
                    </p>
                    <p className="text-sm text-red-600">
                      Please try again or contact us directly at
                      hello@upskill.co.za
                    </p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name and Email */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    {...register('name')}
                    id="name"
                    label="Full Name"
                    placeholder="Your name"
                    error={errors.name?.message}
                    disabled={contactMutation.isPending}
                    required
                  />

                  <Input
                    {...register('email')}
                    id="email"
                    type="email"
                    label="Email Address"
                    placeholder="your@email.com"
                    error={errors.email?.message}
                    disabled={contactMutation.isPending}
                    required
                  />
                </div>

                {/* Subject */}
                <Input
                  {...register('subject')}
                  id="subject"
                  label="Subject"
                  placeholder="What's this about?"
                  error={errors.subject?.message}
                  disabled={contactMutation.isPending}
                  required
                />

                {/* Message */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('message')}
                    id="message"
                    rows={6}
                    placeholder="Tell us more about your question or feedback..."
                    disabled={contactMutation.isPending}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <div className="mt-1 flex justify-between text-sm">
                    {errors.message ? (
                      <p className="text-red-600">{errors.message.message}</p>
                    ) : (
                      <p className="text-gray-500">
                        Share your thoughts, questions, or feedback
                      </p>
                    )}
                    <span
                      className={`${
                        watchedMessage?.length > 900
                          ? 'text-red-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {watchedMessage?.length || 0}/1000
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  loading={contactMutation.isPending}
                  disabled={contactMutation.isPending}
                  size="lg"
                  className="w-full"
                >
                  {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info & Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Contact Information */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Contact Information
              </h3>

              <div className="space-y-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className={`flex items-start space-x-3 rounded-lg p-3 transition-colors ${
                        info.action ? 'cursor-pointer hover:bg-gray-50' : ''
                      }`}
                      onClick={() =>
                        info.action && window.open(info.action, '_blank')
                      }
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                        <Icon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900">
                          {info.title}
                        </h4>
                        <p className="font-medium text-indigo-600">
                          {info.content}
                        </p>
                        <p className="text-sm text-gray-500">
                          {info.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Features */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Why Choose UpSkill?
              </h3>

              <div className="space-y-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                        <Icon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
              <h4 className="mb-2 font-semibold text-gray-900">
                Need immediate help?
              </h4>
              <p className="mb-4 text-sm text-gray-600">
                For urgent technical issues or account problems, reach out to us
                directly.
              </p>
              <Button
                as="a"
                href="mailto:support@upskill.co.za?subject=Urgent%20Support%20Request"
                size="sm"
                variant="primary"
                className="w-full justify-center"
              >
                Contact Support
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
