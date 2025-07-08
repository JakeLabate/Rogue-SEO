import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js'
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import * as url from "node:url";

function id(type, identifier) {
   return `${identifier}#${type}`;
}
class BreadCrumbList {
    constructor(page) {
        this.payload = page;
        this.key = 'BreadcrumbList';
        this.docs = {
            schema: `https://schema.org/${this.key}`,
            google: 'https://developers.google.com/search/docs/appearance/structured-data/breadcrumb'
        }
        this.identifierKeys = {
            ['@type']: this.key,
            ['@id']: id(this.key, page.url),
            "url": page.url,
            "name": page.name,
        }
    }
    id() {
        return this.identifierKeys['@id'];
    }
    idObject() {
        return { '@id': this.identifierKeys['@id'] }
    }
    full(page) {

        // split the url based on the '/' character
        const urlPath = new URL(page.url)?.pathname.split('/').filter(part => part !== '');

        // create a list of breadcrumb items
        let pathBuilder = new URL(page.url).origin;
        let itemListElement = urlPath.map((part, index) => {

            // push to path builder -> keeping track of path
            pathBuilder += '/' + part;

            // generate page name, split on '-' and capitalize each word
            const pathName = new URLtoLastSlugName(pathBuilder).formatName();
            return {
                "@type": 'ListItem',
                "@id": pathBuilder + "#BreadCrumbList_Item",
                "url": pathBuilder,
                "item": pathBuilder,
                "name": pathName,
                "position": index + 1,
            };

        });

        // for generating breadcrumbs for a page with no path (homepage)
        if (itemListElement.length === 0) itemListElement.push({
            "@type": 'ListItem',
            "@id": page.url + "#BreadcrumbListItem",
            "url": page.url,
            "item": page.url,
            "name": new URLtoLastSlugName(pathBuilder).formatName() || "IDDI",
            "position": 1,
        });

        return {
            ...this.identifierKeys,
            itemListElement

        }
    }
}
class URLtoLastSlugName {
    constructor(url) {

        this.name = '';

        try {

            // get last url path segment
            const pathname = new URL(url).pathname;
            const slug = pathname.split('/').pop();

            // Capitalize each word in the slug and join them with spaces
            this.name = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        } catch (error) {
            console.error('Error:', error.message);
        }
    }
    formatName() {

        // List of lowercase words to be excluded from capitalization
        const lowercaseWords = [
            'a', 'an', 'and', 'as', 'are', 'at',
            'but', 'by', 'be', 'being', 'been',
            'can', 'could',
            'do', 'does', 'did',
            // e
            'from', 'for',
            // g
            'have', 'has', 'had', 'how',
            'in', 'is', 'it', 'if',
            // j
            // k
            // l
            'may', 'might', 'must',
            'nor',
            'or', 'on', 'of',
            // p
            // q
            // r
            'shall', 'should', 'so',
            'to',
            // u
            // v
            'with', 'will', 'was', 'were', 'would', 'what', 'when', 'where', 'why', 'who', 'whom', 'whose', 'which',
            // x
            'yet'
            // z
        ];

        // Convert certain words to lowercase if they appear after the first word
        const words = this.name.split(' ');
        const formattedWords = words.map((word, index) => {
            if (index !== 0 && lowercaseWords.includes(word.toLowerCase())) {
                return word.toLowerCase();
            }
            return word;
        });
        this.name = formattedWords.join(' ');

        // return the formatted name
        return this.name;
    }
}

const urls = [

    // home
    "https://iddi.com",

    "https://iddi.com/therapeutic-expertise",
    "https://iddi.com/contact",
    "https://iddi.com/newsletter-sign-up",

    // about-us
    "https://iddi.com/about-us",
    "https://iddi.com/about-us/leadership",
    "https://iddi.com/about-us/research",
    "https://iddi.com/about-us/why-iddi",

    // about us / events
    "https://iddi.com/about-us/events",
    "https://iddi.com/about-us/events/iddi-at-clinical-data-management-innovation-2025",
    "https://iddi.com/about-us/events/iddi-at-clinical-trials-in-oncology-cto-east-coast-2025",
    "https://iddi.com/about-us/events/iddi-at-eucrof24",
    "https://iddi.com/about-us/events/iddi-at-jpm-2024",
    "https://iddi.com/about-us/events/iddi-at-oct-west-coast-2024",
    "https://iddi.com/about-us/events/iddi-at-outsourcing-in-clinical-trials-oct-southern-california-2025",
    "https://iddi.com/about-us/events/iddi-exhibiting-at-cog-uk-2024",
    "https://iddi.com/about-us/events/iddi-exhibiting-at-scdm-2025-annual-conference",

    // about-us / news
    "https://iddi.com/about-us/news",
    "https://iddi.com/about-us/news/eccrt-and-iddi-establish-partnership-for-continuous-development",
    "https://iddi.com/about-us/news/expansion-cohorts-fda-draft-guidance",
    "https://iddi.com/about-us/news/fda-signs-crada-cluepoints",
    "https://iddi.com/about-us/news/happy-holiday-season",
    "https://iddi.com/about-us/news/iddi-30-year-anniversary",
    "https://iddi.com/about-us/news/iddi-achieves-accreditation-in-medidata-rave-edc",
    "https://iddi.com/about-us/news/iddi-announces-collaborative-agreement-with-i-biostat",
    "https://iddi.com/about-us/news/iddi-announces-new-leadership-to-drive-growth-and-innovation",
    "https://iddi.com/about-us/news/iddi-announces-rtsm-partnership-with-clario",
    "https://iddi.com/about-us/news/iddi-announces-the-appointment-of-a-new-chief-commercial-officer",
    "https://iddi.com/about-us/news/iddi-announces-the-appointment-of-dr-everardo-saad-as-senior-medical-expert",
    "https://iddi.com/about-us/news/iddi-appoints-linda-danielson-as-its-new-chief-executive-officer",
    "https://iddi.com/about-us/news/iddi-becomes-a-medidata-rave-edc-partner",
    "https://iddi.com/about-us/news/iddi-newsletter-august-2022",
    "https://iddi.com/about-us/news/iddi-newsletter-december-2023",
    "https://iddi.com/about-us/news/iddi-newsletter-january-2023",
    "https://iddi.com/about-us/news/iddi-newsletter-july-2023",
    "https://iddi.com/about-us/news/iddi-newsletter-november-2021",
    "https://iddi.com/about-us/news/iddi-partner-in-the-shareview-project",
    "https://iddi.com/about-us/news/iddi-reports-successful-partnership-with-tigenix-for-approval-of-chondrocelect",
    "https://iddi.com/about-us/news/iddi-simplifies-collaboration-with-veeva-systems-vault-etmf-solution",
    "https://iddi.com/about-us/news/iddi-xclinical-the-best-of-two-worlds",
    "https://iddi.com/about-us/news/medicon-valley-alliance-mva",
    "https://iddi.com/about-us/news/message-from-our-ceo-on-covid-19",
    "https://iddi.com/about-us/news/newsletter-july-2021",
    "https://iddi.com/about-us/news/statistical-method-for-personalized-medicine",

    // about / team
    "https://iddi.com/about/team/amy-furlong",
    "https://iddi.com/about/team/christophe-michel",
    "https://iddi.com/about/team/damien-tremolet",
    "https://iddi.com/about/team/elisabeth-coart",
    "https://iddi.com/about/team/eric-mees",
    "https://iddi.com/about/team/everardo-saad",
    "https://iddi.com/about/team/gery-lefebvre",
    "https://iddi.com/about/team/henri-tassenoy",
    "https://iddi.com/about/team/jan-verstraelen-msc",
    "https://iddi.com/about/team/jeremy-edwards",
    "https://iddi.com/about/team/judith-de-kempeneer",
    "https://iddi.com/about/team/leandro-garcia-barrado-phd",
    "https://iddi.com/about/team/linda-beneze",
    "https://iddi.com/about/team/marc-buyse",
    "https://iddi.com/about/team/marie-pierre-debroas",
    "https://iddi.com/about/team/matthieu-libbrecht",
    "https://iddi.com/about/team/rob-nichols",
    "https://iddi.com/about/team/stefan-michiels",
    "https://iddi.com/about/team/tara-kervin",
    "https://iddi.com/about/team/tim-davis",
    "https://iddi.com/about/team/tomasz-burzykowski",
    "https://iddi.com/about/team/vaiva-deltuvaite-thomas",
    "https://iddi.com/about/team/vincent-staggs",


    // careers
    "https://iddi.com/careers",
    "https://iddi.com/careers/senior-system-validation-specialist",

    // resources
    "https://iddi.com/resources",
    "https://iddi.com/resources/2021-year-in-preview-the-year-to-come-and-the-year-that-was",
    "https://iddi.com/resources/30-year-anniversary",
    "https://iddi.com/resources/5-proven-strategies-to-improve-recruitment-and-reduce-patient-dropout-in-clinical-trials",
    "https://iddi.com/resources/a-central-statistical-monitoring-of-data-quality-in-clinical-trials",
    "https://iddi.com/resources/accelerated-approvals-aa-not-so-fast",
    "https://iddi.com/resources/adapting-randomization-algorithm",
    "https://iddi.com/resources/adaptive-trials",
    "https://iddi.com/resources/added-value-of-rtsm",
    "https://iddi.com/resources/advanced-biostatistics-services",
    "https://iddi.com/resources/advanced-statistical-methodology",
    "https://iddi.com/resources/an-innovative-statistical-methodology",
    "https://iddi.com/resources/applied-surrogate-endpoint-evaluation-methods-sas-r",
    "https://iddi.com/resources/assessing-activity-in-early-phase-trials-in-oncology-current-designs-for-expansion-cohorts-and-phase-2",
    "https://iddi.com/resources/assessing-treatment-benefit-in-immuno-oncology",
    "https://iddi.com/resources/assessing-treatment-benefit-in-immuno-oncology-2",
    "https://iddi.com/resources/assessing-treatment-efficacy-in-early-phase-oncology-trials",
    "https://iddi.com/resources/bayesian-outcome-adaptive-randomization-designs",
    "https://iddi.com/resources/best-practices-to-accelerate-your-database-lock",
    "https://iddi.com/resources/best-wishes",
    "https://iddi.com/resources/better-clinical-endpoints",
    "https://iddi.com/resources/beyond-traditional-endpoints-a-patient-focused-approach-to-enhancing-rare-disease-trials",
    "https://iddi.com/resources/biomarker-based-clinical-trial-designs",
    "https://iddi.com/resources/biometrics-cro-divide-to-conquer",
    "https://iddi.com/resources/biosimilar-clinical-trials",
    "https://iddi.com/resources/biostatistics-and-sars-cov-2",
    "https://iddi.com/resources/biostatistics-data-management-combined-services-ensuring-you-meet-your-study-goals",
    "https://iddi.com/resources/boosting-trial-efficiency-and-accuracy-by-integrating-biostatistics-data-management",
    "https://iddi.com/resources/cdisc-sdtm-adam-data-standards-implementation-services",
    "https://iddi.com/resources/central-statistical-monitoring-clinical-trials",
    "https://iddi.com/resources/challenges-regulatory-considerations-and-innovative-solutions-for-designing-trials-for-rare-diseases",
    "https://iddi.com/resources/clinical-data-collection",
    "https://iddi.com/resources/clinical-data-management-services",
    "https://iddi.com/resources/clinical-data-quality",
    "https://iddi.com/resources/clinical-data-sharing",
    "https://iddi.com/resources/clinical-development-trends",
    "https://iddi.com/resources/clinical-endpoints-and-treatment-effect-in-immuno-oncology",
    "https://iddi.com/resources/clinical-trial-design-challenges-phase-i-ii-myelodysplastic-syndrome-study",
    "https://iddi.com/resources/commanders-chiefs-clinical-services-c-suite-pharmavoice",
    "https://iddi.com/resources/companion-diagnostics-and-clinical-development-in-oncology-a-statistical-perspective",
    "https://iddi.com/resources/comprehensive-clinical-data-management-services",
    "https://iddi.com/resources/considerations-on-the-mechanics-and-sample-sizes-for-early-trials",
    "https://iddi.com/resources/conversation-between-a-sponsor-and-a-statistician-about-phase-ii-iii-trials-in-oncology",
    "https://iddi.com/resources/data-driven-etmf-and-clinical-data-management",
    "https://iddi.com/resources/data-monitoring-committee",
    "https://iddi.com/resources/data-monitoring-committees-dmc-best-practices",
    "https://iddi.com/resources/decentralized-clinical-trials-how-remote-studies-are-changing-clinical-research-part-1",
    "https://iddi.com/resources/decentralized-clinical-trials-how-remote-studies-are-changing-clinical-research-part-2",
    "https://iddi.com/resources/demystifying-clinical-systems-integration",
    "https://iddi.com/resources/designing-a-randomized-trial-with-sample-size-re-estimation-challenges-and-best-practices",
    "https://iddi.com/resources/does-real-world-evidence-have-a-role-in-precision-oncology",
    "https://iddi.com/resources/dose-optimization-in-oncology-what-is-your-strategy",
    "https://iddi.com/resources/drug-development-in-oncology-and-precision-medicine",
    "https://iddi.com/resources/drug-development-in-oncology-in-the-era-of-precision-medicine",
    "https://iddi.com/resources/drug-supply-strategy-optimization",
    "https://iddi.com/resources/e-clinical-solutions",
    "https://iddi.com/resources/ebook-mastering-idmcs",
    "https://iddi.com/resources/efficient-cro-collaboration",
    "https://iddi.com/resources/efficient-designs-oncology-trials",
    "https://iddi.com/resources/enhancing-clinical-trials-with-regulatory-compliant-data-management-tools-the-comprehensive-support-by-iddi",
    "https://iddi.com/resources/epidemiology-methodology-and-clinical-research-in-the-midst-of-the-covid-19-pandemic",
    "https://iddi.com/resources/essential-insights-for-pharma-and-biotech-understanding-idmcs-part-2",
    "https://iddi.com/resources/essential-insights-for-pharma-biotech-understanding-idmcs-part-1",
    "https://iddi.com/resources/estimands-in-oncology-are-we-censoring-for-the-right-reason",
    "https://iddi.com/resources/evaluating-the-potential-of-relapse-free-survival-as-a-surrogate-for-overall-survival-in-the-adjuvant-therapy-of-melanoma-with-checkpoint-inhibitors",
    "https://iddi.com/resources/expansion-cohorts",
    "https://iddi.com/resources/finding-the-one-how-to-choose-a-clinical-partner-in-sea-of-service-providers",
    "https://iddi.com/resources/from-biomarkers-to-invitro-companion-diagnostic-device",
    "https://iddi.com/resources/from-design-to-submission-iddis-consultancy-and-biostatistical-services-have-you-covered",
    "https://iddi.com/resources/full-service-delivery-project-management",
    "https://iddi.com/resources/future-cancer-clinical-trials",
    "https://iddi.com/resources/gene-signature",
    "https://iddi.com/resources/generalized-pairwise-comparisions-to-assess-treatment-effects",
    "https://iddi.com/resources/generalized-pairwise-comparisons-gpc-by-iddi",
    "https://iddi.com/resources/generalized-pairwise-comparisons-to-assess-treatment-effects",
    "https://iddi.com/resources/gpc-a-novel-statistical-method-for-outcome-analysis-and-reporting-of-prioritized-composite-endpoints",
    "https://iddi.com/resources/gpc-a-novel-statistical-method-for-outcome-analysis-and-reporting-of-prioritized-composite-endpoints-2",
    "https://iddi.com/resources/guide-to-clinical-data-management",
    "https://iddi.com/resources/health-technology-assessment-hta",
    "https://iddi.com/resources/how-generalized-pairwise-comparisons-can-help-reducing-sample-size-in-clinical-trials",
    "https://iddi.com/resources/how-to-optimize-rare-disease-trials",
    "https://iddi.com/resources/how-to-understand-survival-analysis-in-clinical-trials-a-practical-guide",
    "https://iddi.com/resources/id-imagine-a-unified-platform-for-streamlined-project-workflow-management",
    "https://iddi.com/resources/iddi-comments-on-fda-draft-guidance-on-expansion-cohorts",
    "https://iddi.com/resources/iddi-in-contract-pharma",
    "https://iddi.com/resources/iddi-management-of-your-trials-during-covid-19-pandemic",
    "https://iddi.com/resources/iddi-mva-good-morning-meeting-generalized-pairwise-comparisons-gpc",
    "https://iddi.com/resources/iddi-published-an-editorial-on-non-inferiority-trials",
    "https://iddi.com/resources/iddi-statistical-flagship-for-walloon-biotechs",
    "https://iddi.com/resources/idmc-support",
    "https://iddi.com/resources/idmc-support-to-dmcs",
    "https://iddi.com/resources/immunotherapy-against-cancer-challenge-and-opportunities",
    "https://iddi.com/resources/integrating-technology-and-expertise",
    "https://iddi.com/resources/integration-of-biomarker-validation-in-clinical-development-in-oncology",
    "https://iddi.com/resources/investigator-powered-edc",
    "https://iddi.com/resources/is-your-clinical-trial-vulnerable-to-bias-and-loss-of-credibility",
    "https://iddi.com/resources/iss-ise-submission-for-an-investigational-drug-targeting-macular-disorders",
    "https://iddi.com/resources/leveraging-iddis-clinical-data-management-expertise",
    "https://iddi.com/resources/maximizing-clinical-trial-success-the-power-of-combining-iddi-consultancy-biostatistical-and-data-management-services",
    "https://iddi.com/resources/medicon-valley-alliance-qa-interview-with-erik-falvey-from-iddi",
    "https://iddi.com/resources/meeting-randomization-head-on",
    "https://iddi.com/resources/metadata-repositories-leveraging-standards-expertise-and-ai-for-midsize-cros",
    "https://iddi.com/resources/minimization-in-randomized-clinical-trials",
    "https://iddi.com/resources/new-fda-guidance-on-dmcs",
    "https://iddi.com/resources/new-statistical-method-for-treatment-benefit",
    "https://iddi.com/resources/oncology-clinical-trials",
    "https://iddi.com/resources/oncology-trials",
    "https://iddi.com/resources/operational-characteristics-of-generalized-pairwise-comparisons-for-hierarchically-ordered-endpoints",
    "https://iddi.com/resources/optimizing-rare-disease-trials-trial-design-execution",
    "https://iddi.com/resources/optimizing-the-transition-from-early-to-late-phase-trials-in-oncology",
    "https://iddi.com/resources/overcoming-challenges-global-trials-harmonized-sas-sdtm-database",
    "https://iddi.com/resources/overview-of-iddi-services",
    "https://iddi.com/resources/personalized-cancer-medicine",
    "https://iddi.com/resources/personalized-medicine-a-work-in-progress",
    "https://iddi.com/resources/personalized-medicine-getting-more-out-of-clinical-trials",
    "https://iddi.com/resources/phase-1-trials-in-oncology",
    "https://iddi.com/resources/pitfalls-to-avoid-in-clinical-data-collection-and-management",
    "https://iddi.com/resources/podcast-iddi-services",
    "https://iddi.com/resources/podcast-series-accelerated-approvals-emas-conditional-approval-pathway",
    "https://iddi.com/resources/podcast-series-accelerated-approvals-introduction",
    "https://iddi.com/resources/podcast-series-accelerated-approvals-one-vs-two-trials-approach-strategies",
    "https://iddi.com/resources/podcast-series-accelerated-approvals-role-of-aa-for-non-oncology-trials",
    "https://iddi.com/resources/podcast-series-accelerated-approvals-role-of-endpoints",
    "https://iddi.com/resources/podcast-series-accelerated-approvals-role-of-randomization",
    "https://iddi.com/resources/podcast-series-the-fdas-project-optimus-dose-finding-designs",
    "https://iddi.com/resources/podcast-series-the-fdas-project-optimus-dose-optimization",
    "https://iddi.com/resources/podcast-series-the-fdas-project-optimus-episode-3-role-of-pk-pd",
    "https://iddi.com/resources/podcast-series-the-fdas-project-optimus-episode-4-designing-randomized-trials-for-dose-optimization",
    "https://iddi.com/resources/podcast-series-the-fdas-project-optimus-episode-5-gpc-for-dose-finding",
    "https://iddi.com/resources/practice-oriented-pragmatic-trials-can-integrate-innovations-more-rapidly-in-evidence-based-medicine",
    "https://iddi.com/resources/pros-cons-adaptive-designs",
    "https://iddi.com/resources/randomization-and-trial-supply-management-rtsm-services",
    "https://iddi.com/resources/randomization-and-trial-supply-management-system-rtsm",
    "https://iddi.com/resources/randomization-in-oncology-clinical-trials",
    "https://iddi.com/resources/randomization-tests-in-r",
    "https://iddi.com/resources/randomized-clinical-trials-impact-of-covid",
    "https://iddi.com/resources/randomized-clinical-trials-impact-of-covid-19",
    "https://iddi.com/resources/rare-diseases-biostatistical-challenges",
    "https://iddi.com/resources/re-evaluation-of-pathologic-complete-response-as-a-surrogate",
    "https://iddi.com/resources/reali-pooled-analysis-european-post-marketing-studies-toujeo-product",
    "https://iddi.com/resources/regulatory-strategy-support",
    "https://iddi.com/resources/risk-based-fraud-detection-how-centralized-monitoring-can-boost-data-quality",
    "https://iddi.com/resources/safeguard-the-integrity-and-efficacy-of-your-clinical-trials-with-iddi-expert-data-monitoring-committee-support",
    "https://iddi.com/resources/sample-size-re-estimation-as-an-adaptive-design",
    "https://iddi.com/resources/socrates-standard-of-care-randomised-trials-and-the-need-for-big-randomised-data",
    "https://iddi.com/resources/statistical-aspects-in-gastrointestinal-cancer-trials",
    "https://iddi.com/resources/statistical-biomarker-validation-service",
    "https://iddi.com/resources/statistical-considerations-for-trials-in-adjuvant-treatment-of-colorectal-cancer",
    "https://iddi.com/resources/statistical-validation-of-biomarkers",
    "https://iddi.com/resources/statistically-driven-rtsm-solutuions",
    "https://iddi.com/resources/strategic-consulting-and-regulatory-statistics-services",
    "https://iddi.com/resources/study-stratification-factor",
    "https://iddi.com/resources/supporting-shared-decision-making-and-communication-in-breast-cancer-the-shareview-project-2",
    "https://iddi.com/resources/surrogate-endpoints-create-potential-require-statistical-validation",
    "https://iddi.com/resources/surrogates-survival-cancer-trials",
    "https://iddi.com/resources/the-benefit-risk-assessment-of-new-treatments",
    "https://iddi.com/resources/the-challenges-of-trial-supply-management",
    "https://iddi.com/resources/the-critical-role-of-scientific-background-and-therapeutic-area-knowledge-for-clinical-data-managers",
    "https://iddi.com/resources/the-evolving-role-of-clinical-data-managers-in-patient-centric-clinical-trials",
    "https://iddi.com/resources/the-hidden-work-behind-successful-ophthalmology-clinical-trials-part-1",
    "https://iddi.com/resources/the-hidden-work-behind-successful-ophthalmology-clinical-trials-part-2",
    "https://iddi.com/resources/the-importance-of-early-phase-trials-in-precision-oncology",
    "https://iddi.com/resources/the-key-to-successful-regulatory-submission",
    "https://iddi.com/resources/treatment-allocation-randomized-trials",
    "https://iddi.com/resources/trial-design-for-cancer-immunotherapy-a-methodological-toolkit",
    "https://iddi.com/resources/tumor-size-based-measurements-endpoint-cancer-clinical-trials",
    "https://iddi.com/resources/two-challenges-most-rare-disease-trials-face-and-how-to-avoid-them",
    "https://iddi.com/resources/understanding-the-edc-set-up-process-in-clinical-trials",
    "https://iddi.com/resources/understanding-treatment-effect-in-clinical-trials-8-key-tips-for-pharma-and-biotech-companies",
    "https://iddi.com/resources/using-disease-free-survival-as-a-primary-endpoint-in-early-breast-cancer",
    "https://iddi.com/resources/webinar-clinical-trials-for-and-despite-covid-19",
    "https://iddi.com/resources/webinar-minimization-a-flexible-randomization-method",
    "https://iddi.com/resources/webinar-navigating-fdas-expectations-for-drug-approval",
    "https://iddi.com/resources/webinar-randomization-and-the-limits-of-precision-oncology",
    "https://iddi.com/resources/what-is-your-clinical-development-strategy",
    "https://iddi.com/resources/why-do-so-many-phase-3-trials-fail",
    "https://iddi.com/resources/why-do-so-many-phase-iii-clinical-trials-fail",
    "https://iddi.com/resources/why-do-so-many-phase-iii-fail",
    "https://iddi.com/resources/why-phase-3-clinical-trials-fail-and-what-your-first-childhood-crush-can-teach-you-about-it",

    // services
    "https://iddi.com/services",

    "https://iddi.com/services/randomization-and-trial-supply-management",

    // services / biostatistics
    "https://iddi.com/services/biostatistics",
    "https://iddi.com/services/biostatistics/adam-data-standards-implementation",
    "https://iddi.com/services/biostatistics/biostatistical-analysis",
    "https://iddi.com/services/biostatistics/interim-analysis-idmc",

    // services / clinical-data-management
    "https://iddi.com/services/clinical-data-management",
    "https://iddi.com/services/clinical-data-management/electronic-data-capture",
    "https://iddi.com/services/clinical-data-management/sdtm-data-standards-implementation",

    // services / strategic-consulting
    "https://iddi.com/services/strategic-consulting",
    "https://iddi.com/services/strategic-consulting/clinical-development-planning",
    "https://iddi.com/services/strategic-consulting/regulatory-statistics",
    "https://iddi.com/services/strategic-consulting/study-design",

];

const brand = {
    name_short: "IDDI",
    name_full: "International Drug Development Institute",
    url: "https://iddi.com",
    ratingCount: 1,
    ratingValue: 1,
};

const object = {
    WebSite: {
        "@type": "WebSite",
        "@id": brand.url + "#WebSite",
        "url": brand.url,
        "name": brand.name_short,
    },
    AggregateRating: {
        "@type": "AggregateRating",
        "@id": brand.url + "#AggregateRating",
        "url": brand.url,
        "name": brand.name_short,
        "ratingValue": brand.ratingValue,
        "ratingCount": brand.ratingCount,
        "itemReviewed": {
            "@type": "Organization",
            "@id": brand.url + "#Organization",
        }
    },
    Organization: {
        "@type": "Organization",
        "@id": brand.url + "#Organization",
        "url": brand.url,
        "name": brand.name_short,
        "logo": {
            "@type": "ImageObject",
            "@id": brand.url + "#ImageObjectLogo",
            "url": "https://mva.org/wp-content/uploads/2020/01/iddi-logo.png",
            "contentUrl": "https://mva.org/wp-content/uploads/2020/01/iddi-logo.png",
            "name": brand.name_short + " Logo",
            "caption": brand.name_short + " Logo",
        },
        "sameAs": [
            "https://www.linkedin.com/company/iddi",
            "https://twitter.com/IDDI_Official",
            "https://www.facebook.com/profile.php?id=100052568724769",
            "https://www.youtube.com/channel/UC4Ef4_yf5Wurco-2YiVguqg",
        ]
    },
    Brand: {
        "@type": "Brand",
        "@id": brand.url + "#Brand",
        "url": brand.url,
        "name": brand.name_short,
        "sameAs": [
            "https://www.linkedin.com/company/iddi",
            "https://twitter.com/IDDI_Official",
            "https://www.facebook.com/profile.php?id=100052568724769",
            "https://www.youtube.com/channel/UC4Ef4_yf5Wurco-2YiVguqg",
        ]
    },
};

const schema = {
    "iddi.com": [
        object.WebSite,
        object.Organization,
        object.Brand,
        object.AggregateRating
    ],
    "/about-us": [],
    "/about-us/events": [],
    "/about-us/news": [],
    "/about/team": [],
    "/careers": [],
    "/resources": [],
    "/services": [],
    "/services/randomization-and-trial-supply-management": [
        {
            "@type": "Service",
            "@id": "https://iddi.com/services/randomization-and-trial-supply-management#Service",
            "url": "https://iddi.com/services/randomization-and-trial-supply-management",
            "name": new URLtoLastSlugName("https://iddi.com/services/randomization-and-trial-supply-management").formatName(),
            "isPartOf": {
                "@type": "Collection",
                "@id": "https://iddi.com/services#Collection",
                "url": "https://iddi.com/services",
                "name": "IDDI Services",
                "collectionSize": 4
            }
        }
    ],
    "/services/biostatistics": [
        {
            "@type": "Service",
            "@id": "https://iddi.com/services/biostatistics#Service",
            "url": "https://iddi.com/services/biostatistics",
            "name": new URLtoLastSlugName("https://iddi.com/services/biostatistics").formatName(),
            "isPartOf": {
                "@type": "Collection",
                "@id": "https://iddi.com/services#Collection",
                "url": "https://iddi.com/services",
                "name": "IDDI Services",
                "collectionSize": 4
            }
        }
    ],
    "/services/clinical-data-management": [
        {
            "@type": "Service",
            "@id": "https://iddi.com/services/clinical-data-management#Service",
            "url": "https://iddi.com/services/clinical-data-management",
            "name": new URLtoLastSlugName("https://iddi.com/services/clinical-data-management").formatName(),
            "isPartOf": {
                "@type": "Collection",
                "@id": "https://iddi.com/services#Collection",
                "url": "https://iddi.com/services",
                "name": "IDDI Services",
                "collectionSize": 4
            }
        }
    ],
    "/services/strategic-consulting": [
        {
            "@type": "Service",
            "@id": "https://iddi.com/services/strategic-consulting#Service",
            "url": "https://iddi.com/services/strategic-consulting",
            "name": new URLtoLastSlugName("https://iddi.com/services/strategic-consulting").formatName(),
            "isPartOf": {
                "@type": "Collection",
                "@id": "https://iddi.com/services#Collection",
                "url": "https://iddi.com/services",
                "name": "IDDI Services",
                "collectionSize": 4
            }
        }
    ],
};

// 3. Match schemas to URLs
let matchedSchemas = {};
urls.forEach(url => {

    const matchedKeys = Object.keys(schema).filter(key => url.includes(key));
    if (matchedKeys.length > 0) {

        const combinedSchema = matchedKeys.flatMap(key => schema[key]);

        const page = {
            name: new URLtoLastSlugName(url).formatName() || "IDDI",
            url: url
        }

        let Article = {};
        if (url.includes("/resources/")) {
            Article = {
                "@type": "Article",
                "@id": url + "#Article",
                "url": url,
                "name": page.name,
                "headline": page.name,
                "isPartOf": {
                    "@type": "Collection",
                    "@id": "https://iddi.com/resources#Collection",
                    "url": "https://iddi.com/resources",
                    "name": "IDDI Resources",
                }
            }
        }

        let Person = {};
        if (url.includes("/about/team/")) {
            Person =  {
                "@type": "Person",
                "@id": url + "#Person",
                "url": url,
                "name": page.name,
                "isPartOf": {
                    "@type": "Collection",
                    "@id": "https://iddi.com/about/team#Collection",
                    "url": "https://iddi.com/about/team",
                    "name": "IDDI Team Members",
                }
            }
        }

        let Event = {};
        if (url.includes("/about-us/events/")) {
            Event =  {
                "@type": "Event",
                "@id": url + "#Event",
                "url": url,
                "name": page.name,
                // "startDate": "",
                // "location": "",
                "isPartOf": {
                    "@type": "Collection",
                    "@id": "https://iddi.com/about-us/events#Collection",
                    "url": "https://iddi.com/about-us/events",
                    "name": "IDDI Events",
                }
            }
        }

        let NewsArticle = {};
        if (url.includes("/about-us/news/")) {
            NewsArticle =  {
                "@type": "NewsArticle",
                "@id": url + "#NewsArticle",
                "url": url,
                "name": page.name,
                "isPartOf": {
                    "@type": "Collection",
                    "@id": "https://iddi.com/about-us/news#Collection",
                    "url": "https://iddi.com/about-us/news",
                    "name": "IDDI News",
                }
            }
        }

        let JobPosting = {};
        if (url.includes("/careers/")) {
            JobPosting =  {
                "@type": "JobPosting",
                "@id": url + "#JobPosting",
                "url": url,
                "name": page.name,
                "hiringOrganization": object.Organization,
                "title": new URLtoLastSlugName(url).formatName(),
                "description": "IDDI is looking for a " + new URLtoLastSlugName(url).formatName() + " to join their team.",
                // "datePosted": "",
                // "jobLocation": "",
                "isPartOf": {
                    "@type": "Collection",
                    "@id": "https://iddi.com/careers#Collection",
                    "url": "https://iddi.com/careers/news",
                    "name": "IDDI Careers",
                }
            }
        }

        let finalSchema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": url + "#WebPage",
                    "url": url,
                    "name": page.name,
                    "isPartOf": {
                        "@type": "WebSite",
                        "@id": "https://iddi.com#WebSite",
                        "url": "https://iddi.com",
                        "name": "IDDI",
                    }
                },
                new BreadCrumbList(page).full(page),
                ...combinedSchema,
                ...(url.includes("/resources/") ? [Article] : []),
                ...(url.includes("/about/team/") ? [Person] : []),
                ...(url.includes("/about-us/events/") ? [Event] : []),
                ...(url.includes("/about-us/news/") ? [NewsArticle] : []),
                ...(url.includes("/careers/") ? [JobPosting] : []),
            ]
        };

        matchedSchemas[url] = finalSchema;

        // Convert JSON to string
        const jsonString = JSON.stringify(finalSchema, null, 2); // Pretty-printed with 2 spaces

        // Get the path parts from the URL
        const baseDir = './storage';
        const pathname = new URL(url).pathname
        const pathSegments = pathname.split('/').filter(Boolean);

        // If empty path (homepage), write to `storage/index.json`
        const filename = pathSegments.length ? pathSegments[pathSegments.length - 1] : 'home';
        const directoryPath = path.join(baseDir, ...pathSegments.slice(0, -1)); // everything except the last segment
        const filePath = path.join(directoryPath, `${filename}.json`);

        // Ensure nested directory exists
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        // Write the JSON file
        fs.writeFile(filePath, jsonString, (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('Saved:', filePath);
            }
        });

    }

});

console.log(JSON.stringify(matchedSchemas, null, 2));
