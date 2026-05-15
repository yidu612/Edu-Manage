'use client';

import Link from 'next/link';
import { Header } from '@/app/(src)/components/layout/Header';
import { Footer } from '@/app/(src)/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Shield,
  Users,
  AlertTriangle,
  Scale,
  BookOpen,
  CheckCircle,
  XCircle,
  Mail,
} from 'lucide-react';

export default function TermsOfServicePage() {
  const lastUpdated = 'January 23, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-lg">
              Please read these terms carefully before using our platform
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
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold">1. Introduction</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Welcome to ASTU Project Hub (&quot;Platform&quot;,
                    &quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, or
                    &quot;our&quot;). These Terms of Service (&quot;Terms&quot;)
                    govern your access to and use of our university project
                    management platform.
                  </p>
                  <p>
                    By accessing or using the Platform, you agree to be bound by
                    these Terms. If you disagree with any part of these terms,
                    you may not access the Service.
                  </p>
                  <p>
                    This Platform is designed exclusively for students, faculty
                    members, and staff of the university for managing academic
                    projects, proposals, and documentation.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold">2. User Accounts</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">
                      2.1 Account Creation:
                    </strong>{' '}
                    To use certain features of the Platform, you must register
                    for an account using your official university email address.
                    You must provide accurate, current, and complete information
                    during registration.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      2.2 Account Security:
                    </strong>{' '}
                    You are responsible for safeguarding your password and for
                    all activities that occur under your account. You must
                    notify us immediately of any unauthorized use of your
                    account.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      2.3 Account Types:
                    </strong>{' '}
                    The Platform supports different user roles including
                    Students, Teachers/Advisors, and Department Heads, each with
                    specific permissions and responsibilities.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      2.4 Account Termination:
                    </strong>{' '}
                    We reserve the right to suspend or terminate accounts that
                    violate these Terms or are inactive for extended periods.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold">3. Acceptable Use</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    You agree to use the Platform only for lawful purposes and
                    in accordance with these Terms. You agree NOT to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Use the Platform in any way that violates applicable laws
                      or regulations
                    </li>
                    <li>Submit false, misleading, or plagiarized content</li>
                    <li>Impersonate another person or entity</li>
                    <li>Share your account credentials with others</li>
                    <li>
                      Attempt to gain unauthorized access to other accounts or
                      systems
                    </li>
                    <li>Upload malicious software or harmful content</li>
                    <li>
                      Interfere with the proper functioning of the Platform
                    </li>
                    <li>
                      Use automated systems to access the Platform without
                      permission
                    </li>
                    <li>Harass, abuse, or harm other users</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Shield className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    4. Intellectual Property
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">
                      4.1 Platform Content:
                    </strong>{' '}
                    The Platform and its original content, features, and
                    functionality are owned by the university and are protected
                    by copyright, trademark, and other intellectual property
                    laws.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      4.2 User Content:
                    </strong>{' '}
                    You retain ownership of the content you submit (proposals,
                    documentation, etc.). By submitting content, you grant the
                    university a non-exclusive license to use, display, and
                    archive your submissions for academic and administrative
                    purposes.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      4.3 Academic Integrity:
                    </strong>{' '}
                    All submitted work must be original and properly cite any
                    sources used. Plagiarism and academic dishonesty are
                    strictly prohibited and may result in account suspension and
                    academic disciplinary action.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Project Submissions */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    5. Project Submissions
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">
                      5.1 Submission Requirements:
                    </strong>{' '}
                    All project proposals and documentation must meet the
                    requirements set by your department and advisors.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      5.2 Review Process:
                    </strong>{' '}
                    Submitted proposals are subject to review by assigned
                    advisors and department heads. Review decisions are final
                    and binding within the academic framework.
                  </p>
                  <p>
                    <strong className="text-foreground">5.3 Deadlines:</strong>{' '}
                    Users are responsible for meeting all deadlines. The
                    Platform is not responsible for missed deadlines due to
                    technical issues on the user&apos;s end.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      5.4 AI Content Detection:
                    </strong>{' '}
                    The Platform may use AI tools to detect plagiarism and
                    AI-generated content. Users acknowledge and consent to this
                    screening process.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Prohibited Activities */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    6. Prohibited Activities
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>The following activities are strictly prohibited:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Submitting plagiarized or fraudulent academic work</li>
                    <li>
                      Sharing confidential project information without
                      authorization
                    </li>
                    <li>
                      Manipulating or falsifying project data or documentation
                    </li>
                    <li>
                      Creating multiple accounts or sharing account access
                    </li>
                    <li>Bypassing or attempting to bypass security measures</li>
                    <li>
                      Using the Platform for commercial purposes unrelated to
                      academic work
                    </li>
                    <li>Distributing spam or unauthorized advertisements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    7. Limitation of Liability
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">
                      7.1 Service Availability:
                    </strong>{' '}
                    We strive to maintain Platform availability but do not
                    guarantee uninterrupted access. Scheduled maintenance and
                    unexpected outages may occur.
                  </p>
                  <p>
                    <strong className="text-foreground">7.2 Data Loss:</strong>{' '}
                    While we implement reasonable data protection measures, we
                    are not liable for data loss. Users are encouraged to
                    maintain their own backups of important submissions.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      7.3 Third-Party Services:
                    </strong>{' '}
                    The Platform may integrate with third-party services. We are
                    not responsible for the availability or actions of these
                    external services.
                  </p>
                  <p>
                    <strong className="text-foreground">7.4 Disclaimer:</strong>{' '}
                    THE PLATFORM IS PROVIDED &quot;AS IS&quot; WITHOUT
                    WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT
                    WARRANT THAT THE SERVICE WILL BE ERROR-FREE OR MEET YOUR
                    SPECIFIC REQUIREMENTS.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Scale className="h-5 w-5 text-slate-600" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    8. Governing Law & Disputes
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    These Terms shall be governed by and construed in accordance
                    with the laws of the jurisdiction in which the university
                    operates, without regard to conflict of law provisions.
                  </p>
                  <p>
                    Any disputes arising from these Terms or use of the Platform
                    shall first be addressed through the university&apos;s
                    internal dispute resolution procedures before pursuing any
                    legal remedies.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <FileText className="h-5 w-5 text-cyan-600" />
                  </div>
                  <h2 className="text-xl font-semibold">9. Changes to Terms</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    We reserve the right to modify or replace these Terms at any
                    time. We will provide notice of significant changes by
                    posting the new Terms on this page and updating the
                    &quot;Last Updated&quot; date.
                  </p>
                  <p>
                    Your continued use of the Platform after any changes
                    constitutes acceptance of the new Terms. We encourage you to
                    review these Terms periodically.
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
                  <h2 className="text-xl font-semibold">10. Contact Us</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    If you have any questions about these Terms of Service,
                    please contact us:
                  </p>
                  <div className="bg-background rounded-xl p-4 space-y-2">
                    <p>
                      <strong className="text-foreground">Email:</strong>{' '}
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
                href="/privacy"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Shield className="h-4 w-4" />
                View Privacy Policy
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
