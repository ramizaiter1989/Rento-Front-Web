import React from "react"
import {
  Shield,
  User,
  MapPin,
  DollarSign,
  Lock,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  Users,
} from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-blue-100 text-lg">Rento LB - Car Rental Marketplace</p>
          <p className="text-blue-200 text-sm mt-2">Last updated: December 2025</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Rento LB ("Rento", "we", "us", or "our") operates a mobile application that enables users to search, book,
            and connect with car rental providers in Lebanon. The application is operated by Rami Zeaiter as an
            individual developer on behalf of the Rento LB service. We are committed to protecting your privacy and
            handling your data in a transparent and secure manner.
          </p>
        </div>

        {/* Who We Are */}
        <Section icon={<User />} title="1. Who We Are (Data Controller)" color="blue">
          <InfoGrid>
            <InfoItem label="Operator" value="Rami Zeaiter" />
            <InfoItem label="Service Name" value="Rento LB" />
            <InfoItem label="Official App Email" value="social@rento-lb.com" icon={<Mail className="w-4 h-4" />} />
            <InfoItem label="Support Email" value="ramizaiter1989@gmail.com" icon={<Mail className="w-4 h-4" />} />
            <InfoItem label="Phone" value="+961 81 001 301" icon={<Phone className="w-4 h-4" />} />
            <InfoItem label="Service Area" value="Lebanon" icon={<MapPin className="w-4 h-4" />} />
          </InfoGrid>
          <p className="mt-4 text-gray-600 italic">
            Rento LB acts as a digital marketplace that facilitates search and booking between renters and car owners or
            rental agencies.
          </p>
        </Section>

        {/* Information We Collect */}
        <Section icon={<FileText />} title="2. Information We Collect" color="purple">
          <SubSection title="A. Information You Provide">
            <p className="text-gray-600 mb-3">We may collect the following data when you use the app:</p>
            <ul className="space-y-2">
              <ListItem>Full name</ListItem>
              <ListItem>Phone number</ListItem>
              <ListItem>Email address</ListItem>
              <ListItem>Government-issued ID (passport or national ID)</ListItem>
              <ListItem>Driver's license</ListItem>
              <ListItem>Booking requests and history</ListItem>
              <ListItem>Messages, feedback, support tickets, and appeals</ListItem>
            </ul>
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <p className="text-yellow-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                We do not collect selfie or facial verification data.
              </p>
            </div>
          </SubSection>

          <SubSection title="B. Car Owner Information">
            <p className="text-gray-600 mb-3">If you list a vehicle (private owner or agency), we may collect:</p>
            <ul className="space-y-2">
              <ListItem>Identity and contact information</ListItem>
              <ListItem>Vehicle details and registration documents</ListItem>
              <ListItem>Uploaded images and legal documentation</ListItem>
            </ul>
            <p className="mt-3 text-gray-600 text-sm">
              Each submission is reviewed, and we reserve the right to approve or reject any listing if documents are
              missing, incomplete, or not legally valid.
            </p>
          </SubSection>

          <SubSection title="C. Automatically Collected Data">
            <ul className="space-y-2">
              <ListItem>App usage data (non-sensitive)</ListItem>
              <ListItem>Device and technical information (for app functionality and security)</ListItem>
            </ul>
          </SubSection>
        </Section>

        {/* Location Data */}
        <Section icon={<MapPin />} title="3. Location Data" color="green">
          <p className="text-gray-600">
            We may use location data only to display available cars within Lebanon and improve search results. We do not
            track users continuously or in the background.
          </p>
        </Section>

        {/* Payments */}
        <Section icon={<DollarSign />} title="4. Payments" color="emerald">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <ul className="space-y-3">
              <ListItem color="green">
                Payments are currently <strong>cash only</strong>
              </ListItem>
              <ListItem color="green">All payments are made directly between renter and car owner</ListItem>
              <ListItem color="green">Rento LB does not process, store, or collect payment information</ListItem>
              <ListItem color="green">
                A commission model may be introduced in the future, and users will be informed in advance
              </ListItem>
            </ul>
          </div>
        </Section>

        {/* Purpose */}
        <Section icon={<CheckCircle />} title="5. Purpose of Data Collection" color="indigo">
          <p className="text-gray-600 mb-4">We collect and use data to:</p>
          <ul className="space-y-2">
            <ListItem>Enable car search and booking</ListItem>
            <ListItem>Verify eligibility to rent vehicles</ListItem>
            <ListItem>Connect renters with car owners or agencies</ListItem>
            <ListItem>Ensure safety, legality, and transparency</ListItem>
            <ListItem>Manage ratings, reviews, feedback, and disputes</ListItem>
            <ListItem>Provide customer support and communication</ListItem>
            <ListItem>Improve app functionality and user experience</ListItem>
          </ul>
        </Section>

        {/* Marketplace Responsibility */}
        <Section icon={<AlertCircle />} title="6. Marketplace Responsibility Disclaimer" color="orange">
          <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded">
            <p className="text-orange-900 font-semibold mb-3">Rento LB acts only as an intermediary platform.</p>
            <ul className="space-y-2">
              <ListItem color="orange">We facilitate search, booking, and connection</ListItem>
              <ListItem color="orange">
                We are not responsible for future actions, disputes, damages, or agreements between renters and owners
              </ListItem>
              <ListItem color="orange">Any rental agreement is strictly between the two parties</ListItem>
            </ul>
          </div>
        </Section>

        {/* Data Sharing */}
        <Section icon={<Users />} title="7. Data Sharing & Disclosure" color="red">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-900 font-semibold mb-4">We do not sell or share personal data with third parties.</p>
            <p className="text-gray-600 mb-3">Data may only be disclosed if:</p>
            <ul className="space-y-2">
              <ListItem>Required by Lebanese law</ListItem>
              <ListItem>Ordered by a court or legal authority</ListItem>
              <ListItem>Necessary to protect users, legal rights, or public safety</ListItem>
            </ul>
          </div>
        </Section>

        {/* User Rights */}
        <Section icon={<Shield />} title="8. User Rights & Control" color="cyan">
          <p className="text-gray-600 mb-4">Both renters and owners have the right to:</p>
          <div className="grid md:grid-cols-2 gap-3">
            <RightCard>Accept or reject booking requests</RightCard>
            <RightCard>Delete their listings or accounts</RightCard>
            <RightCard>Request correction or deletion of personal data</RightCard>
            <RightCard>Submit feedback, appeals, or support tickets</RightCard>
            <RightCard>Rate and review each other</RightCard>
          </div>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-700">
              To request data deletion, contact:{" "}
              <a href="mailto:social@rento-lb.com" className="text-blue-600 font-semibold hover:underline">
                social@rento-lb.com
              </a>
            </p>
          </div>
        </Section>

        {/* Data Security */}
        <Section icon={<Lock />} title="9. Data Security" color="slate">
          <p className="text-gray-600 mb-4">
            We apply reasonable administrative and technical measures to protect your data from:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <SecurityCard>Unauthorized access</SecurityCard>
            <SecurityCard>Loss or misuse</SecurityCard>
            <SecurityCard>Alteration or disclosure</SecurityCard>
          </div>
          <p className="mt-4 text-gray-600 italic">Access to data is strictly limited to authorized personnel.</p>
        </Section>

        {/* Data Retention */}
        <Section icon={<Calendar />} title="10. Data Retention" color="violet">
          <p className="text-gray-600 mb-4">We retain personal data only as long as necessary to:</p>
          <ul className="space-y-2">
            <ListItem>Operate the service</ListItem>
            <ListItem>Comply with legal obligations</ListItem>
            <ListItem>Resolve disputes</ListItem>
          </ul>
          <p className="mt-4 text-gray-600">
            Users may request deletion at any time unless retention is legally required.
          </p>
        </Section>

        {/* Minimum Age */}
        <Section icon={<User />} title="11. Minimum Age Requirement" color="pink">
          <div className="bg-pink-50 border-l-4 border-pink-400 p-6 rounded">
            <p className="text-pink-900 font-semibold text-lg">You must be at least 18 years old to use Rento LB.</p>
          </div>
        </Section>

        {/* Transparency */}
        <Section icon={<CheckCircle />} title="12. Transparency & Legal Compliance" color="teal">
          <p className="text-gray-600 mb-4">All vehicles listed on Rento LB must be:</p>
          <div className="grid md:grid-cols-3 gap-4">
            <ComplianceCard>Fully legal</ComplianceCard>
            <ComplianceCard>Properly documented</ComplianceCard>
            <ComplianceCard>Approved by our review team</ComplianceCard>
          </div>
          <p className="mt-4 text-gray-600">
            We reserve the right to reject or remove any content or listing that does not meet legal or platform
            standards.
          </p>
        </Section>

        {/* Changes to Policy */}
        <Section icon={<FileText />} title="13. Changes to This Policy" color="gray">
          <p className="text-gray-600">
            We may update this Privacy Policy from time to time. Any changes will be published inside the app and become
            effective immediately.
          </p>
        </Section>

        {/* Contact */}
        <Section icon={<Mail />} title="14. Contact Us" color="blue">
          <p className="text-gray-600 mb-6">If you have any questions or requests regarding this Privacy Policy:</p>
          <div className="grid md:grid-cols-3 gap-4">
            <ContactCard
              icon={<Mail className="w-5 h-5" />}
              value="social@rento-lb.com"
              href="mailto:social@rento-lb.com"
            />
            <ContactCard
              icon={<Mail className="w-5 h-5" />}
              value="ramizaiter1989@gmail.com"
              href="mailto:ramizaiter1989@gmail.com"
            />
            <ContactCard icon={<Phone className="w-5 h-5" />} value="+961 81 001 301" href="tel:+96181001301" />
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div className="bg-slate-800 text-slate-300 py-8 px-6 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm">© 2025 Rento LB. Operated by Rami Zeaiter. All rights reserved.</p>
          <p className="text-xs text-slate-400 mt-2">This privacy policy is effective as of December 2025</p>
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
    green: "text-green-600 bg-green-50",
    emerald: "text-emerald-600 bg-emerald-50",
    indigo: "text-indigo-600 bg-indigo-50",
    orange: "text-orange-600 bg-orange-50",
    red: "text-red-600 bg-red-50",
    cyan: "text-cyan-600 bg-cyan-50",
    slate: "text-slate-600 bg-slate-50",
    violet: "text-violet-600 bg-violet-50",
    pink: "text-pink-600 bg-pink-50",
    teal: "text-teal-600 bg-teal-50",
    gray: "text-gray-600 bg-gray-50",
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

function SubSection({ title, children }) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  )
}

function ListItem({ children, color = "blue" }) {
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
  }

  return (
    <li className="flex items-start gap-3 text-gray-700">
      <span className={`${colors[color]} w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0`}></span>
      <span>{children}</span>
    </li>
  )
}

function InfoGrid({ children }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-gray-900 font-medium flex items-center gap-2">
        {icon && <span className="text-blue-600">{icon}</span>}
        {value}
      </p>
    </div>
  )
}

function RightCard({ children }) {
  return (
    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0" />
      <span className="text-gray-700">{children}</span>
    </div>
  )
}

function SecurityCard({ children }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-3">
      <Lock className="w-5 h-5 text-slate-600 flex-shrink-0" />
      <span className="text-gray-700">{children}</span>
    </div>
  )
}

function ComplianceCard({ children }) {
  return (
    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center">
      <CheckCircle className="w-6 h-6 text-teal-600 mx-auto mb-2" />
      <span className="text-gray-700 font-medium">{children}</span>
    </div>
  )
}

function ContactCard({ icon, value, href }) {
  return (
    <a
      href={href}
      className="bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200 rounded-lg p-4 flex flex-col items-center gap-2 text-center"
    >
      <div className="text-blue-600">{icon}</div>
      <span className="text-gray-700 font-medium text-sm break-all">{value}</span>
    </a>
  )
}
