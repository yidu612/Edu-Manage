'use client';

import Link from 'next/link';
import { Header } from '@/app/(src)/components/layout/Header';
import { Footer } from '@/app/(src)/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Eye,
  Lock,
  Database,
  Share2,
  Clock,
  UserCheck,
  Globe,
  Bell,
  Mail,
  FileText,
  Cookie,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 23, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              How we collect, use, and protect your information
            </p>
            <Badge variant="outline" className="mt-4">
              Last Updated: {lastUpdated}
            </Badge>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold">1. Introduction</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    ASTU Project Hub (&quot;we&quot;, &quot;us&quot;, or
                    &quot;our&quot;) is committed to protecting your privacy.
                    This Privacy Policy explains how we collect, use, disclose,
                    and safeguard your information when you use our university
                    project management platform.
                  </p>
                  <p>
                    By using the Platform, you consent to the data practices
                    described in this policy. If you do not agree with the terms
                    of this Privacy Policy, please do not access or use the
                    Platform.
                  </p>
                  <p>
                    This policy applies to all users of the Platform, including
                    students, faculty members, advisors, and administrative
                    staff.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Database className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    2. Information We Collect
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">
                      2.1 Personal Information:
                    </strong>{' '}
                    When you register for an account, we collect:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Full name</li>
                    <li>University email address</li>
                    <li>Student/Staff ID number</li>
                    <li>Department and program information</li>
                    <li>Profile picture (optional)</li>
                    <li>Contact information</li>
                  </ul>

                  <p className="pt-4">
                    <strong className="text-foreground">
                      2.2 Academic Information:
                    </strong>{' '}
                    In the course of using the Platform, we collect:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Project proposals and documentation</li>
                    <li>Team membership and collaboration data</li>
                    <li>Advisor assignments and feedback</li>
                    <li>Submission history and timestamps</li>
                    <li>Discussion posts and comments</li>
                  </ul>

                  <p className="pt-4">
                    <strong className="text-foreground">
                      2.3 Usage Information:
                    </strong>{' '}
                    We automatically collect:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and features used</li>
                    <li>Time and date of access</li>
                    <li>Referring website addresses</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    3. How We Use Your Information
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    We use the collected information for the following purposes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong className="text-foreground">
                        Account Management:
                      </strong>{' '}
                      To create and manage your user account
                    </li>
                    <li>
                      <strong className="text-foreground">
                        Platform Services:
                      </strong>{' '}
                      To facilitate project management, team collaboration, and
                      advisor assignments
                    </li>
                    <li>
                      <strong className="text-foreground">
                        Communication:
                      </strong>{' '}
                      To send notifications about proposals, deadlines, and
                      system updates
                    </li>
                    <li>
                      <strong className="text-foreground">
                        Academic Records:
                      </strong>{' '}
                      To maintain records of project submissions and approvals
                    </li>
                    <li>
                      <strong className="text-foreground">
                        Platform Improvement:
                      </strong>{' '}
                      To analyze usage patterns and improve our services
                    </li>
                    <li>
                      <strong className="text-foreground">Security:</strong> To
                      detect and prevent fraud, unauthorized access, and other
                      security issues
                    </li>
                    <li>
                      <strong className="text-foreground">Compliance:</strong>{' '}
                      To comply with legal obligations and university policies
                    </li>
                    <li>
                      <strong className="text-foreground">AI Analysis:</strong>{' '}
                      To check submissions for plagiarism and AI-generated
                      content
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Share2 className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    4. Information Sharing
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    We may share your information in the following
                    circumstances:
                  </p>

                  <p>
                    <strong className="text-foreground">
                      4.1 Within the University:
                    </strong>{' '}
                    Your information may be shared with relevant faculty
                    members, advisors, department heads, and administrative
                    staff as necessary for academic purposes.
                  </p>

                  <p>
                    <strong className="text-foreground">
                      4.2 Team Members:
                    </strong>{' '}
                    When you join a project team, certain information (name,
                    email, role) will be visible to other team members.
                  </p>

                  <p>
                    <strong className="text-foreground">
                      4.3 Service Providers:
                    </strong>{' '}
                    We may share information with third-party service providers
                    who assist in operating the Platform (e.g., hosting
                    services, analytics tools). These providers are bound by
                    confidentiality agreements.
                  </p>

                  <p>
                    <strong className="text-foreground">
                      4.4 Legal Requirements:
                    </strong>{' '}
                    We may disclose information if required by law, regulation,
                    legal process, or governmental request.
                  </p>

                  <p>
                    <strong className="text-foreground">4.5 We Do NOT:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Sell your personal information to third parties</li>
                    <li>Share your data with advertisers</li>
                    <li>
                      Use your academic work for commercial purposes without
                      consent
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Lock className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold">5. Data Security</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    We implement appropriate technical and organizational
                    security measures to protect your personal information,
                    including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Encryption of data in transit (HTTPS/TLS)</li>
                    <li>Encryption of sensitive data at rest</li>
                    <li>Secure password hashing</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Regular data backups</li>
                    <li>Employee training on data protection</li>
                  </ul>
                  <p className="pt-4">
                    While we strive to protect your information, no method of
                    transmission over the Internet or electronic storage is 100%
                    secure. We cannot guarantee absolute security.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Clock className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-semibold">6. Data Retention</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">
                      6.1 Active Accounts:
                    </strong>{' '}
                    We retain your personal information as long as your account
                    remains active or as needed to provide services.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      6.2 Academic Records:
                    </strong>{' '}
                    Project submissions, proposals, and related documentation
                    may be retained as part of university academic records in
                    accordance with institutional policies.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      6.3 After Graduation/Departure:
                    </strong>{' '}
                    Upon graduation or departure from the university, your
                    account may be deactivated. Academic records may be retained
                    for archival purposes as required by university policy.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      6.4 Deletion Requests:
                    </strong>{' '}
                    You may request deletion of your personal data, subject to
                    any legal or academic record retention requirements.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Cookie className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    7. Cookies and Tracking
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    We use cookies and similar tracking technologies to enhance
                    your experience:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong className="text-foreground">
                        Essential Cookies:
                      </strong>{' '}
                      Required for basic Platform functionality (authentication,
                      security)
                    </li>
                    <li>
                      <strong className="text-foreground">
                        Preference Cookies:
                      </strong>{' '}
                      Remember your settings and preferences
                    </li>
                    <li>
                      <strong className="text-foreground">
                        Analytics Cookies:
                      </strong>{' '}
                      Help us understand how users interact with the Platform
                    </li>
                  </ul>
                  <p className="pt-4">
                    You can control cookie preferences through your browser
                    settings. Disabling certain cookies may affect Platform
                    functionality.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <UserCheck className="h-5 w-5 text-teal-600" />
                  </div>
                  <h2 className="text-xl font-semibold">8. Your Rights</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Depending on your location, you may have the following
                    rights:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong className="text-foreground">Access:</strong>{' '}
                      Request a copy of your personal data
                    </li>
                    <li>
                      <strong className="text-foreground">Correction:</strong>{' '}
                      Request correction of inaccurate data
                    </li>
                    <li>
                      <strong className="text-foreground">Deletion:</strong>{' '}
                      Request deletion of your data (subject to retention
                      requirements)
                    </li>
                    <li>
                      <strong className="text-foreground">Portability:</strong>{' '}
                      Request your data in a portable format
                    </li>
                    <li>
                      <strong className="text-foreground">Objection:</strong>{' '}
                      Object to certain processing of your data
                    </li>
                    <li>
                      <strong className="text-foreground">Restriction:</strong>{' '}
                      Request restriction of data processing
                    </li>
                    <li>
                      <strong className="text-foreground">
                        Withdraw Consent:
                      </strong>{' '}
                      Withdraw consent for optional data processing
                    </li>
                  </ul>
                  <p className="pt-4">
                    To exercise these rights, contact us using the information
                    provided below. We will respond to requests within the
                    timeframe required by applicable law.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* International Users */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Globe className="h-5 w-5 text-cyan-600" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    9. International Users
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    If you access the Platform from outside our primary
                    jurisdiction, please be aware that your information may be
                    transferred to, stored, and processed in the country where
                    our servers are located.
                  </p>
                  <p>
                    By using the Platform, you consent to the transfer of your
                    information to our facilities and to the facilities of third
                    parties with whom we share it as described in this Privacy
                    Policy.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Shield className="h-5 w-5 text-pink-600" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    10. Children&apos;s Privacy
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    The Platform is intended for university students and staff
                    who are typically 18 years of age or older. We do not
                    knowingly collect personal information from children under
                    13.
                  </p>
                  <p>
                    If we become aware that we have collected personal
                    information from a child under 13, we will take steps to
                    delete such information promptly.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Changes to Policy */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Bell className="h-5 w-5 text-slate-600" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    11. Changes to This Policy
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    We may update this Privacy Policy from time to time. We will
                    notify you of any changes by posting the new Privacy Policy
                    on this page and updating the &quot;Last Updated&quot; date.
                  </p>
                  <p>
                    For significant changes, we will provide additional notice
                    through the Platform (such as a notification banner) or via
                    email.
                  </p>
                  <p>
                    We encourage you to review this Privacy Policy periodically
                    to stay informed about how we protect your information.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">12. Contact Us</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    If you have any questions or concerns about this Privacy
                    Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-background rounded-xl p-4 space-y-2">
                    <p>
                      <strong className="text-foreground">
                        Data Protection Officer:
                      </strong>{' '}
                      privacy@astu-projecthub.edu
                    </p>
                    <p>
                      <strong className="text-foreground">
                        General Support:
                      </strong>{' '}
                      support@astu-projecthub.edu
                    </p>
                    <p>
                      <strong className="text-foreground">Address:</strong> ASTU
                      Project Hub, University Campus, Main Building
                    </p>
                    <p>
                      <strong className="text-foreground">Office Hours:</strong>{' '}
                      Monday - Friday, 9:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/terms"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <FileText className="h-4 w-4" />
                View Terms of Service
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border hover:bg-muted transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
