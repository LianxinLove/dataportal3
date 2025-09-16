<template>
  <div class="privacy-container">
    <main class="policy-content">
      <header class="policy-header">
        <h1>Legal Notice</h1>
        <p>
          Welcome to the DataPortal platform (hereinafter "the Platform")
          accessible at https://phenomics.fudan.edu.cn/firmiana/DP/. Before
          accessing or using the Platform, please carefully read the following
          terms and conditions (hereinafter "the Terms").
        </p>
      </header>

      <section :id="`section`" class="policy-section">
        <h2>Chapter 1: Acceptance and Modification of Terms</h2>
        <div>
          <ul class="content-list">
            <li>
              1. By using the Platform, you are granted access under these
              Terms. Your use of the Platform constitutes full understanding and
              acceptance of all provisions herein
            </li>
            <li>
              2. If you disagree with any part of these Terms, you must
              immediately cease using the Platform. We reserve the right to
              modify these Terms at any time, with updates taking effect upon
              publication on the Platform.
            </li>
          </ul>
        </div>
      </section>
      <section :id="`section`" class="policy-section">
        <h2>Chapter 2: Personal Information Handling</h2>
        <div>
          <ul class="content-list">
            <li>
              1. Data Collection:
              <ul class="content-list">
                <li>
                  • Required registration information: Full name, institutional
                  email address, affiliated organization, and position.
                </li>
              </ul>
            </li>
            <li>
              2. Purpose of Use:
              <ul class="content-list">
                <li>
                  • For account management, service delivery, and compliance
                  audits. Unauthorized disclosure to third parties is
                  prohibited.
                </li>
              </ul>
            </li>
            <li>
              2. Security Measures:
              <ul class="content-list">
                <li>• AES-256 encryption for data storage.</li>
                <li>• Regular security audits to ensure compliance.</li>
              </ul>
            </li>
          </ul>
        </div>
      </section>
      <section :id="`section`" class="policy-section">
        <h2>Chapter 3: User Conduct Guidelines</h2>
        <p>Prohibited activities include but are not limited to:</p>
        <div>
          <ul class="content-list">
            <li>
              1. Unauthorized Access:
              <ul class="content-list">
                <li>
                  • Using crawlers to collect data exceeding 5 API requests per
                  second or attempting SQL injection attacks.
                </li>
              </ul>
            </li>
            <li>
              2. Content Violations:
              <ul class="content-list">
                <li>
                  • Uploading CSV/JSON files containing malicious code or
                  storing genomic data infringing intellectual property rights.
                </li>
              </ul>
            </li>
            <li>
              3. Resource Abuse:
              <ul class="content-list">
                <li>
                  • Non scientific data with a daily download volume exceeding
                  50GB, or occupying more than 80% of cluster computing
                  resources.
                </li>
              </ul>
            </li>
            <li>
              4. Reverse Engineering:
              <ul class="content-list">
                <li>
                  • Decompiling or reverse-engineering bioinformatics analysis
                  tools provided by the Platform.
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </section>
      <section :id="`section`" class="policy-section">
        <h2>Chapter 4: Intellectual Property Rights</h2>
        <div>
          <ul class="content-list">
            <li>
              1. Platform Content:
              <ul class="content-list">
                <li>
                  • All biological databases (e.g., KEGG, Gene Ontology) are the
                  intellectual property of their original rights holders.
                </li>
                <li>
                  • Analysis workflow templates (e.g., Nextflow pipelines) are
                  licensed under CC BY-NC 4.0.
                </li>
              </ul>
            </li>
            <li>
              2. Software Licensing:
              <ul class="content-list">
                <li>
                  • Copyrights to visualization tools are owned by the Company.
                  Reverse engineering for commercial purposes is strictly
                  prohibited.
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </section>
      <section :id="`section`" class="policy-section">
        <h2>Chapter 5: Disclaimer</h2>
        <div>
          <ul class="content-list">
            <li>
              1. Data Accuracy:
              <ul class="content-list">
                <li>
                  • Proteomics reference datasets may contain 0.5% annotation
                  variance; cross-validation is recommended.
                </li>
              </ul>
            </li>
            <li>
              2. Service Availability:
              <ul class="content-list">
                <li>• Annual planned maintenance does not exceed 72 hours.</li>
                <li>
                  • Emergency response time for unexpected outages: ≤4 hours.
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </section>
      <section :id="`section`" class="policy-section">
        <h2>Special Notes</h2>
        <p>
          This Legal Notice applies to all visitors and users. Final
          interpretation of these Terms resides with the Platform.
        </p>
      </section>
    </main>

    <!-- 联系信息 -->
    <footer class="contact-footer">
      <h2>Technical Support</h2>
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
  p {
    text-align: left;
  }
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