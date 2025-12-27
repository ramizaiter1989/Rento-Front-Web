import React from "react"
import {
  FileText,
  Shield,
  Users,
  Car,
  CreditCard,
  Star,
  Scale,
  Ban,
  AlertTriangle,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
} from "lucide-react"

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-700 to-teal-700 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Terms & Conditions</h1>
          </div>
          <p className="text-emerald-100 text-lg">Rento LB - Car Rental Marketplace</p>
          <p className="text-emerald-200 text-sm mt-2">Last updated: December 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Welcome to Rento LB ("Rento", "we", "us", "our"). By accessing or using the Rento LB mobile application, you
            agree to these Terms & Conditions.
          </p>
        </div>

        {/* Service Description */}
        <Section icon={<Shield />} title="1. Service Description" color="blue">
          <p className="text-gray-600 mb-4">Rento LB is a digital marketplace that allows users to:</p>
          <ul className="space-y-3">
            <ListItem>Search and book rental cars</ListItem>
            <ListItem>Connect directly with private car owners or rental agencies</ListItem>
          </ul>
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-900 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Rento does not own vehicles and does not act as a rental company.
            </p>
          </div>
        </Section>

        {/* Eligibility */}
        <Section icon={<Users />} title="2. Eligibility" color="purple">
          <div className="space-y-4">
            <EligibilityCard icon={<CheckCircle />} color="green">
              Users must be at least 18 years old
            </EligibilityCard>
            <EligibilityCard icon={<CheckCircle />} color="green">
              Users must provide valid identification and a driver's license
            </EligibilityCard>
            <EligibilityCard icon={<XCircle />} color="red">
              False or misleading information may result in account suspension
            </EligibilityCard>
          </div>
        </Section>

        {/* User Accounts */}
        <Section icon={<Users />} title="3. User Accounts" color="indigo">
          <p className="text-gray-600 mb-4">You agree to:</p>
          <div className="bg-indigo-50 rounded-lg p-6 mb-4">
            <ul className="space-y-3">
              <ListItem>Provide accurate and legal information</ListItem>
              <ListItem>Keep your account secure</ListItem>
              <ListItem>Accept responsibility for activity under your account</ListItem>
            </ul>
          </div>
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
            <p className="text-orange-900 font-medium">
              Rento reserves the right to suspend or terminate accounts that violate these terms.
            </p>
          </div>
        </Section>

        {/* Car Owners & Listings */}
        <Section icon={<Car />} title="4. Car Owners & Listings" color="cyan">
          <p className="text-gray-600 mb-4">Car owners and agencies:</p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <ResponsibilityCard>Must upload legal vehicle documents</ResponsibilityCard>
            <ResponsibilityCard>Must ensure vehicles are road-legal and insured</ResponsibilityCard>
            <ResponsibilityCard>Have full right to accept or reject booking requests</ResponsibilityCard>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900 font-medium">
              Rento may review, approve, reject, or remove any listing at its sole discretion.
            </p>
          </div>
        </Section>

        {/* Bookings & Payments */}
        <Section icon={<CreditCard />} title="5. Bookings & Payments" color="green">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="space-y-4">
              <PaymentItem icon={<CreditCard />}>Payments are currently cash only</PaymentItem>
              <PaymentItem icon={<Users />}>Payments are made directly to the car owner</PaymentItem>
              <PaymentItem icon={<XCircle />}>Rento does not handle or store payments</PaymentItem>
              <PaymentItem icon={<AlertTriangle />}>
                A commission model may be introduced in the future with prior notice
              </PaymentItem>
            </div>
          </div>
        </Section>

        {/* Marketplace Disclaimer */}
        <Section icon={<AlertTriangle />} title="6. Marketplace Disclaimer" color="orange">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded">
            <h3 className="font-bold text-orange-900 text-lg mb-4">Rento:</h3>
            <ul className="space-y-3 mb-4">
              <ListItem color="orange">Only facilitates search, booking, and connection</ListItem>
              <ListItem color="orange">
                Is not responsible for disputes, damages, accidents, delays, or agreements
              </ListItem>
              <ListItem color="orange">Is not a party to rental contracts</ListItem>
            </ul>
            <div className="bg-orange-100 border border-orange-300 rounded p-4">
              <p className="text-orange-900 font-bold text-center">
                All agreements are strictly between renter and owner.
              </p>
            </div>
          </div>
        </Section>

        {/* Ratings, Reviews & Feedback */}
        <Section icon={<Star />} title="7. Ratings, Reviews & Feedback" color="yellow">
          <p className="text-gray-600 mb-4">Users may:</p>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <FeatureCard>Rate and review each other</FeatureCard>
            <FeatureCard>Submit feedback</FeatureCard>
            <FeatureCard>File support tickets or appeals</FeatureCard>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900 font-medium">Abusive, false, or misleading content may be removed.</p>
          </div>
        </Section>

        {/* Legal Compliance */}
        <Section icon={<Scale />} title="8. Legal Compliance" color="red">
          <p className="text-gray-600 mb-4">Users must comply with:</p>
          <div className="space-y-3">
            <ComplianceItem>Lebanese laws and regulations</ComplianceItem>
            <ComplianceItem>Traffic, insurance, and rental requirements</ComplianceItem>
          </div>
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-900 font-bold">Illegal behavior will result in immediate suspension.</p>
          </div>
        </Section>

        {/* Account Termination */}
        <Section icon={<Ban />} title="9. Account Termination" color="slate">
          <p className="text-gray-600 mb-4">We reserve the right to suspend or terminate accounts for:</p>
          <div className="grid md:grid-cols-3 gap-4">
            <TerminationCard>Fraud</TerminationCard>
            <TerminationCard>Legal violations</TerminationCard>
            <TerminationCard>Abuse of the platform</TerminationCard>
          </div>
        </Section>

        {/* Limitation of Liability */}
        <Section icon={<Shield />} title="10. Limitation of Liability" color="violet">
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
            <p className="text-violet-900 font-bold mb-4">Rento shall not be liable for:</p>
            <ul className="space-y-3">
              <ListItem color="violet">Losses or damages between users</ListItem>
              <ListItem color="violet">Vehicle condition or availability</ListItem>
              <ListItem color="violet">Third-party actions</ListItem>
            </ul>
          </div>
        </Section>

        {/* Changes to Terms */}
        <Section icon={<FileText />} title="11. Changes to Terms" color="teal">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
            <p className="text-gray-700">
              Terms may be updated at any time.{" "}
              <span className="font-bold text-teal-900">Continued use means acceptance.</span>
            </p>
          </div>
        </Section>

        {/* Contact */}
        <Section icon={<Mail />} title="12. Contact" color="blue">
          <p className="text-gray-600 mb-6">If you have questions about these Terms & Conditions:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <ContactCard
              icon={<Mail className="w-5 h-5" />}
              value="social@rento-lb.com"
              href="mailto:social@rento-lb.com"
            />
            <ContactCard icon={<Phone className="w-5 h-5" />} value="+961 81 001 301" href="tel:+96181001301" />
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div className="bg-slate-800 text-slate-300 py-8 px-6 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm">© 2025 Rento LB. Operated by Rami Zeaiter. All rights reserved.</p>
          <p className="text-xs text-slate-400 mt-2">These terms are effective as of December 2025</p>
        </div>
      </div>
    </div>
  )
}

// Reusable Components
function Section({ icon, title, children, color = "blue" }) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    indigo: "text-indigo-600 bg-indigo-50",
    cyan: "text-cyan-600 bg-cyan-50",
    green: "text-green-600 bg-green-50",
    yellow: "text-yellow-600 bg-yellow-50",
    orange: "text-orange-600 bg-orange-50",
    red: "text-red-600 bg-red-50",
    slate: "text-slate-600 bg-slate-50",
    violet: "text-violet-600 bg-violet-50",
    teal: "text-teal-600 bg-teal-50",
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
      <div className="flex items-start gap-3 mb-6">
        <div className={`${colorClasses[color]} p-2 rounded-lg`}>
          {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 flex-1">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function ListItem({ children, color = "blue" }) {
  const colors = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    violet: "bg-violet-500",
  }

  return (
    <li className="flex items-start gap-3 text-gray-700">
      <span className={`${colors[color]} w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0`}></span>
      <span>{children}</span>
    </li>
  )
}

function EligibilityCard({ icon, color, children }) {
  const colorClasses = {
    green: "bg-green-50 border-green-200 text-green-900",
    red: "bg-red-50 border-red-200 text-red-900",
  }

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4 flex items-center gap-3`}>
      {React.cloneElement(icon, { className: "w-5 h-5 flex-shrink-0" })}
      <span className="font-medium">{children}</span>
    </div>
  )
}

function ResponsibilityCard({ children }) {
  return (
    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0" />
      <span className="text-gray-700">{children}</span>
    </div>
  )
}

function PaymentItem({ icon, children }) {
  return (
    <div className="flex items-start gap-3 text-gray-700">
      <div className="text-green-600 mt-1">{React.cloneElement(icon, { className: "w-5 h-5" })}</div>
      <span className="font-medium">{children}</span>
    </div>
  )
}

function FeatureCard({ children }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
      <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
      <span className="text-gray-700 font-medium">{children}</span>
    </div>
  )
}

function ComplianceItem({ children }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
      <Scale className="w-5 h-5 text-red-600 flex-shrink-0" />
      <span className="text-gray-700 font-medium">{children}</span>
    </div>
  )
}

function TerminationCard({ children }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
      <Ban className="w-6 h-6 text-slate-600 mx-auto mb-2" />
      <span className="text-gray-700 font-medium">{children}</span>
    </div>
  )
}

function ContactCard({ icon, value, href }) {
  return (
    <a
      href={href}
      className="bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 rounded-lg p-6 flex flex-col items-center gap-3 text-center"
    >
      <div className="text-blue-600">{icon}</div>
      <span className="text-gray-700 font-medium break-all">{value}</span>
    </a>
  )
}
