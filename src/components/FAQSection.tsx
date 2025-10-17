import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I upload videos?',
    answer: 'Navigate to the Video Editor page, click on the upload zone, and select your video file. Supported formats include MP4, MOV, and AVI.',
  },
  {
    question: 'What are the monetization options?',
    answer: 'SochBox offers multiple monetization streams including brand collaborations, digital product sales, and ad revenue sharing.',
  },
  {
    question: 'How do I access AI tools?',
    answer: 'Go to the AI Tools page from the sidebar. You can generate content ideas, captions, and thumbnail prompts with one click.',
  },
  {
    question: 'Can I schedule posts in advance?',
    answer: 'Yes! Use the Publish Insights page to see optimal posting times and schedule your content in advance.',
  },
  {
    question: 'How do I track my earnings?',
    answer: 'Visit the Monetization Dashboard to see a detailed breakdown of your revenue sources, trends, and payment history.',
  },
];

export const FAQSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
