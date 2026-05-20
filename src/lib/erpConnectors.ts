/**
 * ERP connector catalog.
 *
 * Drives the onboarding integration picker and the live "Integration Status"
 * card on the dashboard. Adding a new ERP is just appending an entry here.
 */

export type ConnectionMethod =
    | "plugin"
    | "oauth"
    | "webhook"
    | "rest_api"
    | "spreadsheet"
    | "manual";

export type Difficulty = "easy" | "medium" | "custom";

export type SnippetLanguage = "curl" | "python" | "node" | "php" | "csharp" | "xml" | "abap";

export interface ErpConnector {
    id: string;
    name: string;
    vendor: string;
    /** First-letter monogram shown in the card avatar */
    monogram: string;
    /** Tailwind background-color class for the avatar */
    color: string;
    /** Tailwind text-color class for the avatar monogram */
    textColor: string;
    /** Short one-liner shown under the name */
    description: string;
    /** Who this is a great fit for */
    recommendedFor: string;
    connectionMethod: ConnectionMethod;
    /** Primary action label shown on the integration screen */
    primaryActionLabel: string;
    /** Verb used in the dashboard banner ("Connected via …") */
    connectionLabel: string;
    difficulty: Difficulty;
    /** Pretty-printed setup-time estimate */
    setupTime: string;
    /** Ordered list of setup steps */
    setupSteps: string[];
    /** Public docs URL */
    docsUrl: string;
    /** Code samples by language. Keys present are the only tabs rendered. */
    snippets: Partial<Record<SnippetLanguage, { label: string; code: string }>>;
    /** Whether to show a "Recommended" ribbon */
    recommended?: boolean;
    /** Whether the ERP is webhookable for live status updates */
    supportsLiveUpdates: boolean;
}

const SHARED_REST_PAYLOAD = `{
  "invoice_type": "Tax",
  "invoice_number": "INV-2026-0001",
  "issue_date": "2026-05-20",
  "supplier": { "trn": "300000000000003", "name": "Your Co.",
                "street": "King Fahd Rd", "building_number": "1234",
                "city": "Riyadh", "district": "Al Olaya",
                "postal_code": "12345", "country_code": "SA" },
  "customer": { "trn": "310123456789003", "name": "Acme Ltd",
                "street": "Olaya St", "building_number": "5678",
                "city": "Riyadh", "district": "Sulaimaniyah",
                "postal_code": "11564", "country_code": "SA" },
  "line_items": [
    { "name": "Service", "quantity": "1", "price": "1000",
      "vat_rate": "15", "tax_code": "S" }
  ],
  "currency_code": "SAR"
}`;

const CURL_SNIPPET = {
    label: "cURL",
    code: `curl -X POST https://api.zatcabridge.com/api/v1/invoices/submit-to-zatca?action=clear \\
  -H "Authorization: Bearer $ZB_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${SHARED_REST_PAYLOAD}'`,
};

const PYTHON_SNIPPET = {
    label: "Python",
    code: `import os, requests

response = requests.post(
    "https://api.zatcabridge.com/api/v1/invoices/submit-to-zatca",
    params={"action": "clear"},
    headers={"Authorization": f"Bearer {os.environ['ZB_API_KEY']}"},
    json=${SHARED_REST_PAYLOAD},
    timeout=30,
)
response.raise_for_status()
print(response.json()["status"])  # CLEARED / REPORTED / REJECTED`,
};

const NODE_SNIPPET = {
    label: "Node.js",
    code: `import fetch from "node-fetch";

const res = await fetch(
  "https://api.zatcabridge.com/api/v1/invoices/submit-to-zatca?action=clear",
  {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.ZB_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(${SHARED_REST_PAYLOAD}),
  },
);
const data = await res.json();
console.log(data.status, data.clearance_uuid);`,
};

const PHP_SNIPPET = {
    label: "PHP",
    code: `<?php
$payload = ${SHARED_REST_PAYLOAD};

$ch = curl_init('https://api.zatcabridge.com/api/v1/invoices/submit-to-zatca?action=clear');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . getenv('ZB_API_KEY'),
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS     => json_encode($payload),
]);
$response = json_decode(curl_exec($ch), true);
echo $response['status'];`,
};

const CSHARP_SNIPPET = {
    label: "C# / .NET",
    code: `using System.Net.Http.Json;

var http = new HttpClient { BaseAddress = new Uri("https://api.zatcabridge.com/api/v1/") };
http.DefaultRequestHeaders.Authorization =
    new("Bearer", Environment.GetEnvironmentVariable("ZB_API_KEY"));

var payload = ${SHARED_REST_PAYLOAD};

var resp = await http.PostAsJsonAsync("invoices/submit-to-zatca?action=clear", payload);
resp.EnsureSuccessStatusCode();
var result = await resp.Content.ReadFromJsonAsync<dynamic>();
Console.WriteLine(result!.status);`,
};

export const ERP_CONNECTORS: ErpConnector[] = [
    {
        id: "tally",
        name: "Tally Prime",
        vendor: "Tally Solutions",
        monogram: "T",
        color: "bg-emerald-100",
        textColor: "text-emerald-700",
        description: "Tally Prime / Tally ERP 9 with TDL connector",
        recommendedFor: "SMEs already running Tally for accounting",
        connectionMethod: "plugin",
        primaryActionLabel: "Download Tally TDL connector",
        connectionLabel: "Tally TDL plugin",
        difficulty: "easy",
        setupTime: "10 min",
        setupSteps: [
            "Download the ZATCA-Bridge TDL file (zatca-bridge.tdl)",
            "In Tally, go to F12 → TDLs & Add-Ons → Manage Local TDLs",
            "Load zatca-bridge.tdl and restart Tally",
            "Enter your API key under Gateway of Tally → ZATCA Bridge Setup",
            "Every sales voucher you save now ships to ZATCA automatically",
        ],
        docsUrl: "/dashboard/docs",
        snippets: {
            xml: {
                label: "TDL fragment",
                code: `[#Form: Sales Voucher]
    On: After Save : YES : CALL : ZBSubmitInvoice

[Function: ZBSubmitInvoice]
    Variable: ApiKey : String : @@ZBApiKey
    HTTP Post : "https://api.zatcabridge.com/api/v1/invoices/submit-to-zatca?action=clear" : \\
                "Authorization: Bearer " + $$ApiKey : \\
                @@BuildInvoicePayload`,
            },
        },
        recommended: true,
        supportsLiveUpdates: true,
    },
    {
        id: "quickbooks",
        name: "QuickBooks Online",
        vendor: "Intuit",
        monogram: "Q",
        color: "bg-green-100",
        textColor: "text-green-700",
        description: "QuickBooks Online with OAuth + webhook",
        recommendedFor: "Cloud accounting customers, multi-currency",
        connectionMethod: "oauth",
        primaryActionLabel: "Connect with QuickBooks (OAuth)",
        connectionLabel: "QuickBooks OAuth",
        difficulty: "easy",
        setupTime: "5 min",
        setupSteps: [
            "Click Connect with QuickBooks — you'll be redirected to Intuit",
            "Authorize ZATCA Bridge to read your invoices & customers",
            "We register a webhook on your QuickBooks company file",
            "Every Invoice.Create event fires our /submit-to-zatca pipeline",
            "Cleared / Reported status writes back as a private note on the invoice",
        ],
        docsUrl: "/dashboard/docs",
        snippets: {
            node: {
                label: "Webhook handler",
                code: `// pages/api/quickbooks/webhook.ts
import { submitToZatca } from "@/lib/zatca-bridge";

export default async function handler(req, res) {
  const event = req.body.eventNotifications?.[0]?.dataChangeEvent;
  for (const entity of event?.entities ?? []) {
    if (entity.name === "Invoice" && entity.operation === "Create") {
      const inv = await qbo.getInvoice(entity.id);
      await submitToZatca(mapQboInvoice(inv), { action: "clear" });
    }
  }
  res.status(200).end();
}`,
            },
        },
        supportsLiveUpdates: true,
    },
    {
        id: "zoho",
        name: "Zoho Books",
        vendor: "Zoho Corp",
        monogram: "Z",
        color: "bg-red-100",
        textColor: "text-red-700",
        description: "Zoho Books — Saudi edition, native VAT support",
        recommendedFor: "Businesses already on Zoho One",
        connectionMethod: "webhook",
        primaryActionLabel: "Configure Zoho Books webhook",
        connectionLabel: "Zoho Books webhook",
        difficulty: "easy",
        setupTime: "15 min",
        setupSteps: [
            "In Zoho Books → Settings → Automation → Workflows",
            "Create a New Workflow for the Invoices module on Created event",
            "Add a Webhook action pointing to your ZATCA Bridge tenant URL",
            "Map the JSON payload using the field mapping template we provide",
            "Save — every new invoice in Zoho now hits ZATCA in under a second",
        ],
        docsUrl: "/dashboard/docs",
        snippets: {
            curl: {
                label: "Manual relay",
                code: `# Pull a Zoho invoice and forward it to ZATCA Bridge
INVOICE=$(curl -s "https://books.zoho.com/api/v3/invoices/$ZOHO_INVOICE_ID" \\
  -H "Authorization: Zoho-oauthtoken $ZOHO_TOKEN")

curl -X POST https://api.zatcabridge.com/api/v1/invoices/submit-to-zatca?action=clear \\
  -H "Authorization: Bearer $ZB_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d "$(jq -f zoho-to-zatca.jq <<< $INVOICE)"`,
            },
        },
        supportsLiveUpdates: true,
    },
    {
        id: "sap",
        name: "SAP Business One",
        vendor: "SAP",
        monogram: "S",
        color: "bg-blue-100",
        textColor: "text-blue-700",
        description: "SAP B1 / S4 HANA via Service Layer",
        recommendedFor: "Enterprises with existing SAP rollouts",
        connectionMethod: "rest_api",
        primaryActionLabel: "Add REST relay to SAP",
        connectionLabel: "SAP Service Layer",
        difficulty: "custom",
        setupTime: "2 hours",
        setupSteps: [
            "Create a User-Defined Object (UDO) for ZatcaBridge_Config holding API key",
            "Add a Service Layer event handler on Invoices.Add to call our REST API",
            "Map UDO fields to ZATCA Bridge supplier / customer / lines schema",
            "Deploy the SAP add-on and test against the sandbox tenant first",
            "Once green, point the same add-on at the production tenant",
        ],
        docsUrl: "/dashboard/docs",
        snippets: {
            abap: {
                label: "Service Layer handler (TypeScript)",
                code: `// SAP B1 Service Layer event handler
import axios from "axios";

export async function onInvoiceAdded(invoice: B1Invoice) {
  await axios.post(
    "https://api.zatcabridge.com/api/v1/invoices/submit-to-zatca",
    mapB1ToZatca(invoice),
    {
      params: { action: "clear" },
      headers: { Authorization: \`Bearer \${process.env.ZB_API_KEY}\` },
    },
  );
}`,
            },
        },
        supportsLiveUpdates: true,
    },
    {
        id: "dynamics",
        name: "Microsoft Dynamics",
        vendor: "Microsoft",
        monogram: "D",
        color: "bg-sky-100",
        textColor: "text-sky-700",
        description: "Dynamics 365 Finance / Business Central",
        recommendedFor: "Multi-entity enterprises on Microsoft cloud",
        connectionMethod: "rest_api",
        primaryActionLabel: "Configure Power Automate flow",
        connectionLabel: "Power Automate flow",
        difficulty: "medium",
        setupTime: "45 min",
        setupSteps: [
            "Open Power Automate and create a new automated cloud flow",
            "Trigger: When a record is created → Dataverse → Invoices table",
            "Action: HTTP POST → our /invoices/submit-to-zatca endpoint",
            "Use the connector reference in our Dynamics documentation",
            "Test in your sandbox environment before enabling in production",
        ],
        docsUrl: "/dashboard/docs",
        snippets: {
            csharp: CSHARP_SNIPPET,
        },
        supportsLiveUpdates: true,
    },
    {
        id: "netsuite",
        name: "Oracle NetSuite",
        vendor: "Oracle",
        monogram: "N",
        color: "bg-amber-100",
        textColor: "text-amber-700",
        description: "NetSuite via SuiteScript 2.x RESTlet",
        recommendedFor: "Mid-market & enterprise running NetSuite ERP",
        connectionMethod: "rest_api",
        primaryActionLabel: "Install SuiteScript module",
        connectionLabel: "NetSuite SuiteScript",
        difficulty: "medium",
        setupTime: "1 hour",
        setupSteps: [
            "Deploy our SuiteScript 2.x user-event script on Transaction → Invoice",
            "Set the script parameter ZB_API_KEY to your ZATCA Bridge token",
            "On afterSubmit, the script POSTs to /invoices/submit-to-zatca",
            "Status responses are written back to a custom field on the invoice",
            "Schedule a daily SuiteScript audit to reconcile any failed submissions",
        ],
        docsUrl: "/dashboard/docs",
        snippets: {
            node: {
                label: "SuiteScript 2.x",
                code: `// User Event Script — Invoice afterSubmit
define(["N/https"], (https) => {
  function afterSubmit(ctx) {
    if (ctx.type !== ctx.UserEventType.CREATE) return;
    const inv = mapNetsuiteToZatca(ctx.newRecord);
    https.post.promise({
      url: "https://api.zatcabridge.com/api/v1/invoices/submit-to-zatca?action=clear",
      headers: {
        Authorization: \`Bearer \${runtime.getCurrentScript().getParameter("custscript_zb_api_key")}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inv),
    });
  }
  return { afterSubmit };
});`,
            },
        },
        supportsLiveUpdates: true,
    },
    {
        id: "odoo",
        name: "Odoo",
        vendor: "Odoo S.A.",
        monogram: "O",
        color: "bg-purple-100",
        textColor: "text-purple-700",
        description: "Odoo 16+ via custom module",
        recommendedFor: "Open-source Odoo users",
        connectionMethod: "plugin",
        primaryActionLabel: "Install Odoo module",
        connectionLabel: "Odoo addon",
        difficulty: "easy",
        setupTime: "20 min",
        setupSteps: [
            "Install the zatca_bridge Odoo module from our repo",
            "Settings → ZATCA Bridge → paste your API key & environment",
            "On account.move.action_post we relay the invoice to our REST endpoint",
            "ZATCA clearance UUID is stored on the move record for audit",
            "Optional: enable our Odoo cron to retry any failed submissions hourly",
        ],
        docsUrl: "/dashboard/docs",
        snippets: {
            python: {
                label: "Odoo addon hook",
                code: `# addons/zatca_bridge/models/account_move.py
from odoo import models
import requests

class AccountMove(models.Model):
    _inherit = "account.move"

    def action_post(self):
        res = super().action_post()
        for move in self.filtered(lambda m: m.move_type == "out_invoice"):
            payload = move._zatca_payload()
            r = requests.post(
                "https://api.zatcabridge.com/api/v1/invoices/submit-to-zatca",
                params={"action": "clear"},
                headers={"Authorization": f"Bearer {self.env['ir.config_parameter'].get_param('zb.api_key')}"},
                json=payload, timeout=30,
            )
            move.zatca_clearance_uuid = r.json().get("clearance_uuid")
        return res`,
            },
        },
        supportsLiveUpdates: true,
    },
    {
        id: "custom",
        name: "Custom / In-house ERP",
        vendor: "Your team",
        monogram: "{}",
        color: "bg-slate-100",
        textColor: "text-slate-700",
        description: "Roll your own with our REST API",
        recommendedFor: "Internal ERPs, bespoke systems, agencies",
        connectionMethod: "rest_api",
        primaryActionLabel: "Copy your API key",
        connectionLabel: "Direct REST API",
        difficulty: "medium",
        setupTime: "30 min",
        setupSteps: [
            "Grab your API key from Dashboard → API",
            "Wire your invoice-creation hook to POST our /invoices/submit-to-zatca endpoint",
            "Map your invoice schema onto our JSON (validators help: /invoices/validate)",
            "Subscribe to webhook events to react to clearance / rejection",
            "Ship it. Our sandbox environment mirrors production 1:1",
        ],
        docsUrl: "/dashboard/docs/api",
        snippets: {
            curl: CURL_SNIPPET,
            python: PYTHON_SNIPPET,
            node: NODE_SNIPPET,
            php: PHP_SNIPPET,
            csharp: CSHARP_SNIPPET,
        },
        supportsLiveUpdates: true,
    },
    {
        id: "excel",
        name: "Excel / Spreadsheets",
        vendor: "Microsoft 365 / Google Sheets",
        monogram: "X",
        color: "bg-teal-100",
        textColor: "text-teal-700",
        description: "Batch upload via CSV / XLSX template",
        recommendedFor: "Low-volume invoicing, retail, freelancers",
        connectionMethod: "spreadsheet",
        primaryActionLabel: "Download Excel template",
        connectionLabel: "Spreadsheet uploads",
        difficulty: "easy",
        setupTime: "5 min",
        setupSteps: [
            "Download the invoice_template.xlsx template",
            "Fill one row per invoice — column descriptions are inside the file",
            "Drop the file on Dashboard → Invoices → Bulk Upload",
            "We validate, sign, and submit each row to ZATCA",
            "A reconciled CSV is emailed back showing every clearance UUID",
        ],
        docsUrl: "/dashboard/docs",
        snippets: {},
        supportsLiveUpdates: false,
    },
    {
        id: "manual",
        name: "Manual entry",
        vendor: "ZATCA Bridge dashboard",
        monogram: "✎",
        color: "bg-amber-100",
        textColor: "text-amber-700",
        description: "Just use the dashboard — no setup needed",
        recommendedFor: "Just starting out, very low volume",
        connectionMethod: "manual",
        primaryActionLabel: "Start creating invoices",
        connectionLabel: "Dashboard manual entry",
        difficulty: "easy",
        setupTime: "0 min",
        setupSteps: [
            "Open Dashboard → Invoices → New",
            "Pick a customer, fill in line items, click Sign & Submit",
            "We handle XML, signing, QR, and ZATCA submission for you",
            "Done. Move to Tally / API later if you scale up",
        ],
        docsUrl: "/dashboard/docs",
        snippets: {},
        supportsLiveUpdates: false,
    },
];

export function findConnector(id: string | null | undefined): ErpConnector | undefined {
    if (!id) return undefined;
    return ERP_CONNECTORS.find((c) => c.id === id);
}

export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; color: string }> = {
    easy: { label: "Easy", color: "bg-emerald-100 text-emerald-700" },
    medium: { label: "Medium", color: "bg-amber-100 text-amber-700" },
    custom: { label: "Custom", color: "bg-rose-100 text-rose-700" },
};
