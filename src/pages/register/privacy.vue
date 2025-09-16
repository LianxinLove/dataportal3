<template>
  <div class="privacy-container">
    <!-- 头部 -->
    <!-- <header class="policy-header">
      <h1>Privacy Policy</h1>
      <div class="meta-info">
        <p>Effective Date: {{ effectiveDate }}</p>
        <p>Last Updated: {{ lastUpdated }}</p>
      </div>
    </header> -->

    <!-- 目录导航 -->
    <!-- <nav class="toc" v-if="showToc">
      <h2>Table of Contents</h2>
      <ul>
        <li v-for="(section, index) in sections" :key="index">
          <a :href="`#section-${index}`">{{ section.title }}</a>
        </li>
      </ul>
    </nav> -->

    <!-- 政策内容 -->
    <main class="policy-content">
      <header class="policy-header">
        <h1>Privacy Policy</h1>
      </header>

      <section :id="`section`" class="policy-section">
        <h2>Chapter 1: Information Collection and Use</h2>
        <div>
          <p>1. Scenarios and Types of Data Collection</p>
          <p>
            We collect necessary personal information in the following
            scenarios:
          </p>
          <ul class="content-list">
            <li>
              1. Account Registration: Mobile number, email, password, name,
              company name, and job title.
            </li>
            <li>
              2. Product Inquiries: Information submitted via forms, including
              name, contact details, company information, and service
              requirements.
            </li>
            <li>
              3. Real-Name Authentication: ID card details (for scenarios
              requiring verification, e.g., enterprise accounts).
            </li>
            <li>
              4. Service Usage:
              <ul class="content-list">
                <li>
                  Device Information: Device model, operating system, IP
                  address, and browser type.
                </li>
                <li>
                  Payment Transactions: Bank card details and transaction
                  records (processed by third-party payment gateways; we only
                  receive payment confirmations).
                </li>
                <li>
                  Customer Support: Service tickets, communication records, and
                  call recordings (for quality assurance).
                </li>
              </ul>
            </li>
            <li>
              5. Real-Name Authentication: ID card details (for scenarios
              requiring verification, e.g., enterprise accounts).
            </li>
          </ul>
          <p>2. Purposes of Data Use</p>
          <ul class="content-list">
            <li>
              1. To fulfill contractual obligations (e.g., account management,
              service delivery).
            </li>
            <li>
              2. Security verification and risk control (e.g., fraud detection).
            </li>
            <li>3. Product optimization (via anonymized analytics)</li>
            <li>
              4. Legal compliance (e.g., responding to regulatory requests).
            </li>
          </ul>
        </div>
      </section>
      <section :id="`section`" class="policy-section">
        <h2>Chapter 2: Cookies and Tracking Technologies</h2>
        <div>
          <ul class="content-list">
            <li>
              1. Functional Cookies: Maintain login sessions and language
              preferences.
            </li>
            <li>
              2. Analytical Cookies: Track traffic sources via tools like Google
              Analytics (opt-out via browser settings).
            </li>
            <li>
              3. Third-Party SDKs: Examples include WeChat Login SDK and Alipay
              SDK; data handling follows third-party privacy terms.
            </li>
          </ul>
        </div>
      </section>
      <section :id="`section`" class="policy-section">
        <h2>Chapter 3: Cookies and Tracking Technologies</h2>
        <div>
          <ul class="content-list">
            <li>
              1. Functional Cookies: Maintain login sessions and language
              preferences.
            </li>
            <li>
              2. Analytical Cookies: Track traffic sources via tools like Google
              Analytics (opt-out via browser settings).
            </li>
            <li>
              3. Third-Party SDKs: Examples include WeChat Login SDK and Alipay
              SDK; data handling follows third-party privacy terms.
            </li>
          </ul>
        </div>
      </section>
      <section :id="`section`" class="policy-section">
        <h2>Chapter 4: Data Storage and Cross-Border Transfers</h2>
        <div>
          <ul class="content-list">
            <li>
              1. Retention Period: Basic account data is retained for 6 months
              post-account closure for dispute resolution.
            </li>
            <li>
              2. Storage Location: All data is stored on servers within Mainland
              China; no cross-border transfers occur.
            </li>
          </ul>
        </div>
      </section>
      <section :id="`section`" class="policy-section">
        <h2>Chapter 5: Your Rights</h2>
        <p>You may exercise the following rights:</p>
        <div>
          <ul class="content-list">
            <li>
              1. Access/Correction: Update information via your account
              dashboard.
            </li>
            <li>
              2. Deletion/Account Closure: Submit requests to [Support Email];
              processed within 15 business days.
            </li>
            <li>
              3. Withdraw Consent: Disable device permissions (may affect
              service functionality).
            </li>
          </ul>
        </div>
      </section>
      <section :id="`section`" class="policy-section">
        <h2>Chapter 6: Security Measures</h2>
        <p>You may exercise the following rights:</p>
        <div>
          <ul class="content-list">
            <li>
              1. TLS encryption, distributed storage, and regular security
              audits.
            </li>
            <li>
              2. Employee confidentiality agreements and role-based data access
              controls.
            </li>
          </ul>
        </div>
      </section>
      <section :id="`section`" class="policy-section">
        <h2>Chapter 7: Protection of Minors</h2>
        <p>You may exercise the following rights:</p>
        <div>
          <ul class="content-list">
            <li>
              1. Users under 14 are prohibited from self-registration.
              Accidentally collected data will be promptly deleted.
            </li>
          </ul>
        </div>
      </section>
      <section :id="`section`" class="policy-section">
        <h2>Chapter 8: Policy Updates and Dispute Resolution</h2>
        <p>You may exercise the following rights:</p>
        <div>
          <ul class="content-list">
            <li>
              1. Material changes will be notified via website announcements or
              emails; continued use implies acceptance.
            </li>
            <li>
              2. Disputes shall be resolved by courts in the jurisdiction where
              the service provider is located.
            </li>
          </ul>
        </div>
      </section>
    </main>

    <!-- 联系信息 -->
    <footer class="contact-footer">
      <h2>Contact Us</h2>
      <div class="contact-methods">
        <p>Email: {{ contact.email }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

const contact = reactive({
  email: "jinwenf@fudan.edu.cn",
  phone: "+1 (555) 123-4567",
});
</script>

<style lang="less" scoped>
.privacy-container {
  background: white;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Segoe UI", sans-serif;
  line-height: 1.6;
  min-height: 100vh;
  text-align: left;
}

.policy-header {
  text-align: center;
}

.meta-info {
  color: #666;
}

.policy-section {
  margin: 0 0;
  padding: 1rem;
}

.contact-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  text-align: center;
}

.content-list {
  padding-left: 1.5rem;
  margin: 1rem 0;
  li {
    margin: 0.5rem 0;
    text-align: left !important;
    width: 100%;
    // padding-left: 0.5rem;
  }
}

@media (max-width: 768px) {
  .privacy-container {
    padding: 1rem;
  }

  .toc {
    display: none;
  }
}

a {
  color: #3182ce;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
<route>
{ meta: { layout: 'AuthLayout' } }
</route>