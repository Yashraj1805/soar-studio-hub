import { motion } from 'framer-motion';
import { TicketForm } from '@/components/TicketForm';
import { TicketList } from '@/components/TicketList';
import { FAQSection } from '@/components/FAQSection';
import { ChatWidget } from '@/components/ChatWidget';

const HelpDesk = () => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold">Help Desk</h1>
        <p className="text-muted-foreground mt-2">
          Get support and manage your tickets
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-8"
        >
          <TicketForm />
          <TicketList />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <FAQSection />
        </motion.div>
      </div>

      <ChatWidget />
    </div>
  );
};

export default HelpDesk;
