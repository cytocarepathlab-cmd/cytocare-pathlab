"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FaBuilding,
  FaDownload,
  FaFileInvoiceDollar,
  FaFileMedical,
  FaHome,
  FaPlus,
  FaPrint,
  FaRedo,
  FaSearch,
  FaShareAlt,
  FaSignOutAlt,
  FaTable,
  FaTrash,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";

type ClientProfile = {
  id: string;
  client_name?: string | null;
  name?: string | null;
  lab_name?: string | null;
  client_code?: string | null;
  show_client_rate?: boolean;
  billing_enabled?: boolean;
  phone?: string | null;
  mobile?: string | null;
};

type ClientReport = {
  report_id: string;
  file_name: string;
  report_url: string;
  file_size: number;
  uploaded_at: string;
};

type PriceListRpcRow = {
  row_data?: Record<string, unknown>;
};

type ClientPriceItem = {
  id: string;
  product: string;
  vials: string;
  clientRate: number;
  mrp: number;
  reportingTime: string;
  category: string;
};

type BillingPatientDraft = {
  localId: string;
  patientName: string;
  sex: "" | "Male" | "Female" | "Other";
  age: string;
  doctorName: string;
  mobile: string;
  testSearch: string;
  selectedPriceIds: string[];
  discountEnabled: boolean;
  discountAmount: string;
  paidAmount: string;
};

type GeneratedBillItem = {
  id?: string;
  price_id?: string | null;
  test_name: string;
  category?: string | null;
  rate: number;
};

type GeneratedBillPatient = {
  id: string;
  patient_order: number;
  patient_name: string;
  age?: number | null;
  doctor_name?: string | null;
  sex?: string | null;
  mobile?: string | null;
  gross_amount: number;
  discount_amount: number;
  final_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_status: string;
  payment_updated_at?: string | null;
  items: GeneratedBillItem[];
};

type GeneratedBill = {
  id: string;
  serial_no: number;
  client_id: string;
  client_name: string | null;
  client_code: string | null;
  total_patients: number;
  gross_amount: number;
  discount_amount: number;
  final_amount: number;
  paid_amount: number;
  due_amount: number;
  created_at: string;
  patients: GeneratedBillPatient[];
};

function newBillingPatient(index = 1): BillingPatientDraft {
  return {
    localId: `${Date.now()}-${index}-${Math.random()
      .toString(36)
      .slice(2)}`,

    patientName: "",
    sex: "",
    age: "",
    doctorName: "",
    mobile: "",
    testSearch: "",
    selectedPriceIds: [],
    discountEnabled: false,
    discountAmount: "",
    paidAmount: "",
  };
}

export default function ClientPortalPage() {
  const [clientCode, setClientCode] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [client, setClient] = useState<ClientProfile | null>(null);

  const [reports, setReports] = useState<ClientReport[]>([]);
  const [priceList, setPriceList] = useState<ClientPriceItem[]>([]);
  const [reportWhatsappNumbers, setReportWhatsappNumbers] = useState<
    Record<string, string>
  >({});

  const [activeTab, setActiveTab] = useState<
    "reports" | "priceList" | "billing" | "pastBills"
  >("reports");

  const [search, setSearch] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);

  const [billingPatients, setBillingPatients] = useState<BillingPatientDraft[]>([
    newBillingPatient(1),
  ]);
  const [billingSaving, setBillingSaving] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<GeneratedBill | null>(null);
  const [billingHistory, setBillingHistory] = useState<GeneratedBill[]>([]);
  const [billingHistoryLoading, setBillingHistoryLoading] = useState(false);
  const [selectedBillingHistoryDate, setSelectedBillingHistoryDate] =
    useState("");
  const [paymentEditPatientId, setPaymentEditPatientId] = useState("");
  const [additionalPayment, setAdditionalPayment] = useState("");
  const [paymentSavingPatientId, setPaymentSavingPatientId] = useState("");

  function getClientName(clientData: ClientProfile | null) {
    if (!clientData) return "Client";

    return (
      clientData.client_name ||
      clientData.lab_name ||
      clientData.name ||
      "Client"
    );
  }

  function rupees(value: number | null | undefined) {
    return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
  }

  function formatDate(value: string | null | undefined) {
    if (!value) return "Not available";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getRawText(raw: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
      const value = raw[key];

      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return String(value);
      }
    }

    return "";
  }

  function getRawNumber(raw: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
      const value = raw[key];

      if (value !== undefined && value !== null && String(value).trim() !== "") {
        const numberValue = Number(value);

        if (!Number.isNaN(numberValue)) {
          return numberValue;
        }
      }
    }

    return 0;
  }

  function normalizePriceRow(row: PriceListRpcRow, index: number) {
    const raw = row.row_data ?? {};

    return {
      id:
        getRawText(raw, ["id", "test_id", "product_id"]) ||
        `price-row-${index}`,
      product:
        getRawText(raw, ["product", "test_name", "name", "test"]) ||
        "Unnamed Test",
      vials: getRawText(raw, ["vials", "vial", "sample_type", "sample"]),
      clientRate: getRawNumber(raw, [
        "client_rate",
        "client_lab_rate",
        "lab_rate",
        "rate",
        "clientRate",
      ]),
      mrp: getRawNumber(raw, ["mrp", "MRP", "price", "patient_price"]),
      reportingTime: getRawText(raw, [
        "reporting_time",
        "reportingTime",
        "report_time",
        "tat",
      ]),
      category: getRawText(raw, ["category", "department", "section"]),
    };
  }

  async function downloadAndOpenReport(report: ClientReport) {
    try {
      const previewWindow = window.open("", "_blank");

      const response = await fetch(
        `/api/download-report?url=${encodeURIComponent(
          report.report_url
        )}&name=${encodeURIComponent(report.file_name)}`
      );

      if (!response.ok) {
        previewWindow?.close();
        throw new Error("Unable to download report.");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download =
        report.file_name || "cytocare-report.pdf";

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      if (previewWindow) {
        previewWindow.location.href = blobUrl;
      } else {
        window.open(blobUrl, "_blank");
      }

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to download report."
      );
    }
  }

  async function shareReport(report: ClientReport) {
    try {
      const response = await fetch(
        `/api/download-report?url=${encodeURIComponent(
          report.report_url
        )}&name=${encodeURIComponent(report.file_name)}`
      );

      if (!response.ok) {
        throw new Error("Unable to prepare report for sharing.");
      }

      const blob = await response.blob();
      const fileName = report.file_name || "cytocare-report.pdf";

      const pdfFile = new File([blob], fileName, {
        type: "application/pdf",
      });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [pdfFile],
        })
      ) {
        await navigator.share({
          files: [pdfFile],
          title: "CytoCare Path Lab Report",
          text: "CytoCare Path Lab - Patient Report",
        });

        return;
      }

      alert(
        "Direct PDF sharing is not supported on this device/browser. Please download the report and share it from your phone."
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      alert(
        error instanceof Error
          ? error.message
          : "Unable to share report."
      );
    }
  }

  function updateReportWhatsappNumber(reportId: string, value: string) {
    setReportWhatsappNumbers((prev) => ({
      ...prev,
      [reportId]: value,
    }));
  }

  async function loadBillingHistory(
    clientId?: string,
    pin?: string
  ) {
    const activeClientId = clientId ?? client?.id;
    const activePin = pin ?? loginPin;

    if (!activeClientId || !activePin) {
      return;
    }

    setBillingHistoryLoading(true);

    try {
      const response = await fetch(
        "/api/client-billing/history",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: activeClientId,
            loginPin: activePin,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to load previous bills."
        );
      }

      const history =
        (result.bills ?? []) as GeneratedBill[];

      setBillingHistory(history);

      if (history.length > 0) {
        const latestDate =
          getBillingHistoryDateKey(
            history[0].created_at
          );

        setSelectedBillingHistoryDate(
          (current) => current || latestDate
        );
      } else {
        setSelectedBillingHistoryDate("");
      }
    } catch (error) {
      console.error(
        "Client billing history error:",
        error
      );

      setBillingHistory([]);
    } finally {
      setBillingHistoryLoading(false);
    }
  }

  async function updatePastBillPayment(
    bill: GeneratedBill,
    patient: GeneratedBillPatient
  ) {
    if (!client?.id) {
      alert("Client session not found.");
      return;
    }

    const additional = Number(additionalPayment || 0);

    if (!Number.isFinite(additional) || additional <= 0) {
      alert("Enter a valid additional payment amount.");
      return;
    }

    if (additional > Number(patient.due_amount || 0)) {
      alert(
        `Additional payment cannot be more than due amount ${rupees(
          patient.due_amount
        )}.`
      );
      return;
    }

    setPaymentSavingPatientId(patient.id);

    try {
      const response = await fetch(
        "/api/client-billing/update-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId: client.id,
            loginPin,
            patientId: patient.id,
            additionalPayment: additional,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update payment."
        );
      }

      setAdditionalPayment("");
      setPaymentEditPatientId("");

      await loadBillingHistory(client.id, loginPin);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update payment."
      );
    } finally {
      setPaymentSavingPatientId("");
    }
  }

  async function loginClient() {
    if (!clientCode.trim() || !loginPin.trim()) {
      alert("Please enter client code and PIN.");
      return;
    }

    setLoginLoading(true);

    const { data, error } = await supabase.rpc("client_portal_login", {
      p_client_code: clientCode.trim(),
      p_login_pin: loginPin.trim(),
    });

    if (error) {
      alert(error.message);
      setLoginLoading(false);
      return;
    }

    const loggedClient = Array.isArray(data) ? data[0] : data;

    if (!loggedClient?.id) {
      alert("Invalid client code or PIN.");
      setLoginLoading(false);
      return;
    }

    let billingEnabled = Boolean(loggedClient.billing_enabled);

    // This separate permission RPC lets billing work even if your older
    // client_portal_login function does not yet return billing_enabled.
    const { data: permissionData, error: permissionError } = await supabase.rpc(
      "client_get_billing_permission",
      {
        p_client_id: loggedClient.id,
        p_login_pin: loginPin.trim(),
      }
    );

    if (!permissionError) {
      billingEnabled = Boolean(permissionData);
    }

    const fullClient = {
      ...(loggedClient as ClientProfile),
      billing_enabled: billingEnabled,
    };

    setClient(fullClient);

    await Promise.all([
      loadReports(loggedClient.id, loginPin.trim()),
      loadPriceList(loggedClient.id, loginPin.trim()),
      billingEnabled
        ? loadBillingHistory(
            loggedClient.id,
            loginPin.trim()
          )
        : Promise.resolve(),
    ]);

    setLoginLoading(false);
  }

  async function loadReports(clientId?: string, pin?: string) {
    const activeClientId = clientId ?? client?.id;
    const activePin = pin ?? loginPin;

    if (!activeClientId || !activePin) {
      return;
    }

    setReportsLoading(true);

    const { data, error } = await supabase.rpc(
      "client_get_uploaded_reports",
      {
        p_client_id: activeClientId,
        p_login_pin: activePin,
      }
    );

    if (error) {
      alert(error.message);
      setReports([]);
      setReportsLoading(false);
      return;
    }

    setReports((data ?? []) as ClientReport[]);
    setReportsLoading(false);
  }

  async function loadPriceList(clientId?: string, pin?: string) {
    const activeClientId = clientId ?? client?.id;
    const activePin = pin ?? loginPin;

    if (!activeClientId || !activePin) return;

    setPriceLoading(true);

    const { data, error } = await supabase.rpc(
      "client_get_price_list_v2",
      {
        p_client_id: activeClientId,
        p_login_pin: activePin,
      }
    );

    if (error) {
      alert(error.message);
      setPriceList([]);
      setPriceLoading(false);
      return;
    }

    const normalized = ((data ?? []) as PriceListRpcRow[]).map(
      (row, index) => normalizePriceRow(row, index)
    );

    setPriceList(normalized);
    setPriceLoading(false);
  }

  async function refreshData() {
    await Promise.all([
      loadReports(),
      loadPriceList(),
      client?.billing_enabled
        ? loadBillingHistory()
        : Promise.resolve(),
    ]);
  }

  function logoutClient() {
    setClient(null);
    setReports([]);
    setPriceList([]);
    setSearch("");
    setClientCode("");
    setLoginPin("");
    setActiveTab("reports");
    setGeneratedBill(null);
    setBillingHistory([]);
    setSelectedBillingHistoryDate("");
    setBillingPatients([newBillingPatient(1)]);
  }

  function getBillingHistoryDateKey(
    value: string
  ) {
    const parts = new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(new Date(value));

    const year =
      parts.find(
        (part) => part.type === "year"
      )?.value || "";

    const month =
      parts.find(
        (part) => part.type === "month"
      )?.value || "";

    const day =
      parts.find(
        (part) => part.type === "day"
      )?.value || "";

    return `${year}-${month}-${day}`;
  }

  function formatBillingHistoryDate(
    dateKey: string
  ) {
    if (!dateKey) return "Select date";

    const [year, month, day] =
      dateKey.split("-").map(Number);

    return new Date(
      year,
      month - 1,
      day
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const billingHistoryDates = useMemo(
    () =>
      Array.from(
        new Set(
          billingHistory.map((bill) =>
            getBillingHistoryDateKey(
              bill.created_at
            )
          )
        )
      ).sort((a, b) => b.localeCompare(a)),
    [billingHistory]
  );

  const visibleBillingHistory = useMemo(
    () =>
      billingHistory.filter(
        (bill) =>
          getBillingHistoryDateKey(
            bill.created_at
          ) === selectedBillingHistoryDate
      ),
    [
      billingHistory,
      selectedBillingHistoryDate,
    ]
  );

  const filteredReports = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q || activeTab !== "reports") {
      return reports;
    }

    return reports.filter((report) =>
      report.file_name.toLowerCase().includes(q)
    );
  }, [reports, search, activeTab]);

  const filteredPriceList = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q || activeTab !== "priceList") return priceList;

    return priceList.filter((item) =>
      [
        item.product,
        item.vials,
        item.category,
        item.reportingTime,
        item.clientRate,
        item.mrp,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [priceList, search, activeTab]);

  function updateBillingPatient(
    localId: string,
    changes: Partial<BillingPatientDraft>
  ) {
    setBillingPatients((prev) =>
      prev.map((patient) =>
        patient.localId === localId
          ? {
              ...patient,
              ...changes,
            }
          : patient
      )
    );
  }

  function addBillingPatient() {
    setGeneratedBill(null);
    setBillingPatients((prev) => [
      ...prev,
      newBillingPatient(prev.length + 1),
    ]);
  }

  function removeBillingPatient(localId: string) {
    setGeneratedBill(null);

    setBillingPatients((prev) => {
      if (prev.length === 1) {
        return [newBillingPatient(1)];
      }

      return prev.filter((patient) => patient.localId !== localId);
    });
  }

  function toggleBillingTest(localId: string, priceId: string) {
    setGeneratedBill(null);

    const isRealPriceId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      priceId
    );

    if (!isRealPriceId) {
      alert(
        "This test does not have a valid database price ID. Please make sure client_get_price_list_v2 returns the price-list id."
      );
      return;
    }

    setBillingPatients((prev) =>
      prev.map((patient) => {
        if (patient.localId !== localId) return patient;

        const alreadySelected =
          patient.selectedPriceIds.includes(priceId);

        return {
          ...patient,
          selectedPriceIds: alreadySelected
            ? patient.selectedPriceIds.filter((id) => id !== priceId)
            : [...patient.selectedPriceIds, priceId],
        };
      })
    );
  }

  function getPatientSelectedTests(patient: BillingPatientDraft) {
    const selected = new Set(patient.selectedPriceIds);
    return priceList.filter((item) => selected.has(item.id));
  }

  function getPatientGross(patient: BillingPatientDraft) {
    return getPatientSelectedTests(patient).reduce(
      (sum, item) => sum + Number(item.mrp || 0),
      0
    );
  }

  function getPatientDiscount(patient: BillingPatientDraft) {
    if (!patient.discountEnabled) return 0;

    const raw = Number(patient.discountAmount || 0);
    const gross = getPatientGross(patient);

    if (!Number.isFinite(raw) || raw <= 0) return 0;

    return Math.min(raw, gross);
  }

  function getPatientFinal(patient: BillingPatientDraft) {
    return Math.max(
      getPatientGross(patient) - getPatientDiscount(patient),
      0
    );
  }

function getPatientPaid(
  patient: BillingPatientDraft
) {
  const finalAmount =
    getPatientFinal(patient);

  const paid =
    Number(patient.paidAmount || 0);

  if (
    !Number.isFinite(paid) ||
    paid < 0
  ) {
    return 0;
  }

  return Math.min(
    paid,
    finalAmount
  );
}

function getPatientDue(
  patient: BillingPatientDraft
) {
  return Math.max(
    getPatientFinal(patient) -
      getPatientPaid(patient),
    0
  );
}

  const billingTotals = useMemo(() => {
    const gross = billingPatients.reduce(
      (sum, patient) => sum + getPatientGross(patient),
      0
    );

    const discount = billingPatients.reduce(
      (sum, patient) => sum + getPatientDiscount(patient),
      0
    );

    const paid = billingPatients.reduce(
      (sum, patient) => sum + getPatientPaid(patient),
      0
    );

    const final = Math.max(gross - discount, 0);
    const due = Math.max(final - paid, 0);

    return {
      gross,
      discount,
      final,
      paid,
      due,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingPatients, priceList]);

  async function confirmBilling() {
    if (!client?.id) {
      alert("Client session not found.");
      return;
    }

    if (!client.billing_enabled) {
      alert("Billing is disabled for this client.");
      return;
    }

    if (priceLoading) {
      alert("Please wait for the test price list to finish loading.");
      return;
    }

    for (let index = 0; index < billingPatients.length; index += 1) {
      const patient = billingPatients[index];

      if (!patient.patientName.trim()) {
        alert(`Please enter Patient ${index + 1} name.`);
        return;
      }

      if (!patient.sex) {
        alert(`Please select Patient ${index + 1} sex.`);
        return;
      }

      if (
        patient.mobile &&
        patient.mobile.replace(/\D/g, "").length !== 10
      ) {
        alert(
          `Please enter a valid 10-digit mobile for Patient ${index + 1}.`
        );
        return;
      }

      if (patient.selectedPriceIds.length === 0) {
        alert(
          `Please select at least one test for Patient ${index + 1}.`
        );
        return;
      }

      const gross = getPatientGross(patient);
      const discount = Number(patient.discountAmount || 0);

      if (
        patient.discountEnabled &&
        (!Number.isFinite(discount) || discount < 0)
      ) {
        alert(`Invalid discount amount for Patient ${index + 1}.`);
        return;
      }

      if (patient.discountEnabled && discount > gross) {
        alert(
          `Discount cannot be more than the gross amount for Patient ${
            index + 1
          }.`
        );
        return;
      }

      const finalAmount = getPatientFinal(patient);
      const enteredPaid = Number(patient.paidAmount || 0);

      if (!Number.isFinite(enteredPaid) || enteredPaid < 0) {
        alert(`Invalid paid amount for Patient ${index + 1}.`);
        return;
      }

      if (enteredPaid > finalAmount) {
        alert(
          `Paid amount cannot be more than billed amount for Patient ${
            index + 1
          }.`
        );
        return;
      }
    }

    /*
      IMPORTANT FOR SMARTPHONES:
      Open the print window immediately from the user's button tap,
      before the async API request starts. This greatly reduces the
      chance that Chrome/Safari blocks the print popup.
    */
    const printWindow = window.open(
      "",
      "_blank",
      "width=420,height=720"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups for this website so the 58mm bill can print."
      );
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Generating CytoCare Bill...</title>
        </head>
        <body style="font-family:Arial,sans-serif;padding:20px;text-align:center;">
          <h3>Generating Bill...</h3>
          <p>Please wait.</p>
        </body>
      </html>
    `);
    printWindow.document.close();

    setBillingSaving(true);

    try {
      const response = await fetch("/api/client-billing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: client.id,
          loginPin,
          patients: billingPatients.map((patient) => ({
            patientName: patient.patientName.trim(),
            age: patient.age
    ? Number(patient.age)
    : null,
            sex: patient.sex,
             doctorName: patient.doctorName.trim(),
            mobile: patient.mobile.replace(/\D/g, ""),
            priceIds: patient.selectedPriceIds,
            discountAmount: patient.discountEnabled
              ? Number(patient.discountAmount || 0)
              : 0,
              paidAmount:
  Number(
    patient.paidAmount || 0
  ),
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create bill.");
      }

      const createdBill = result.bill as GeneratedBill;

      // Write the 58mm receipt into the already-opened window
      // and automatically trigger the smartphone/browser print dialog.
      printBillData(createdBill, undefined, printWindow);

      // Refresh past bills so the newly generated bill is immediately available.
      void loadBillingHistory(
        client.id,
        loginPin
      );

      // Immediately reset the billing screen for the next patient/bill.
      setGeneratedBill(null);
      setBillingPatients([newBillingPatient(1)]);
      setSearch("");
    } catch (error) {
      printWindow.close();

      alert(
        error instanceof Error
          ? error.message
          : "Unable to create bill."
      );
    } finally {
      setBillingSaving(false);
    }
  }

  function escapeHtml(value: string | number | null | undefined) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function printBillData(
    bill: GeneratedBill,
    patientId?: string,
    existingWindow?: Window | null
  ) {
    const printPatients = patientId
      ? bill.patients.filter(
          (patient) => patient.id === patientId
        )
      : bill.patients;

    const receiptHtml = printPatients
      .map((patient) => {
        const billNumber = `${String(bill.serial_no).padStart(
          6,
          "0"
        )}-${patient.patient_order}`;

        const testLines = patient.items
          .map(
            (item) => `
              <div class="row test-row">
                <span class="test-name">${escapeHtml(
                  item.test_name
                )}</span>
                <span class="amount">₹${Number(
                  item.rate
                ).toFixed(2)}</span>
              </div>
            `
          )
          .join("");

        const discountLine =
          Number(patient.discount_amount || 0) > 0
            ? `
              <div class="row">
                <span>Discount</span>
                <span>-₹${Number(
                  patient.discount_amount
                ).toFixed(2)}</span>
              </div>
            `
            : "";

        return `
  <section class="receipt">

    <div class="center bold title">
      CYTOCARE PATH LAB
    </div>

    <div class="center">
      Quality Care Innovation
    </div>

    <div class="center">
      Ph: 6203572424
    </div>

    <div class="center">
      9934345686
    </div>


    <div class="line"></div>


    <div>
      <b>Client:</b>
      ${escapeHtml(
        bill.client_name ||
          bill.client_code ||
          ""
      )}
    </div>


    <div>
      <b>Bill No:</b>
      #${escapeHtml(billNumber)}
    </div>


    <div>
      <b>Date:</b>
      ${escapeHtml(
        formatDate(bill.created_at)
      )}
    </div>


    <div class="line"></div>


    <div>
      <b>Patient:</b>
      ${escapeHtml(
        patient.patient_name
      )}
    </div>


    <div>
      <b>Age / Sex:</b>

      ${
        patient.age !== null &&
        patient.age !== undefined
          ? `${escapeHtml(
              patient.age
            )} Years`
          : "-"
      }

      /

      ${escapeHtml(
        patient.sex || "-"
      )}
    </div>


    ${
      patient.mobile
        ? `
          <div>
            <b>Mobile:</b>
            ${escapeHtml(
              patient.mobile
            )}
          </div>
        `
        : ""
    }


    ${
      patient.doctor_name
        ? `
          <div>
            <b>Doctor:</b>
            ${escapeHtml(
              patient.doctor_name
            )}
          </div>
        `
        : ""
    }


    <div class="line"></div>


    ${testLines}


    <div class="line"></div>


    ${
      Number(
        patient.discount_amount || 0
      ) > 0
        ? `
          <div class="row">
            <span>Gross Total</span>

            <span>
              ₹${Number(
                patient.gross_amount
              ).toFixed(2)}
            </span>
          </div>

          ${discountLine}
        `
        : ""
    }


    <div class="row total">

      <span>TOTAL</span>

      <span>
        ₹${Number(
          patient.final_amount
        ).toFixed(2)}
      </span>

    </div>

    <div class="line"></div>

    <div class="row">
      <span>Paid</span>
      <span>
        ₹${Number(
          patient.paid_amount || 0
        ).toFixed(2)}
      </span>
    </div>

    <div class="row">
      <span>Due</span>
      <span>
        ₹${Number(
          patient.due_amount || 0
        ).toFixed(2)}
      </span>
    </div>

    <div>
      <b>Payment:</b>
      ${escapeHtml(
        patient.payment_status || "Due"
      )}
    </div>


    <div class="line"></div>


    <div class="center thank-you">
      Thank You
    </div>

  </section>
`;
      })
      .join("");

    const printWindow =
      existingWindow ||
      window.open(
        "",
        "_blank",
        "width=420,height=720"
      );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print the bill."
      );
      return;
    }

    printWindow.document.open();

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />
          <title>CytoCare Bill</title>

          <style>
            @page {
              size: 58mm auto;
              margin: 2mm;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: white;
              color: black;
              font-family: Arial, Helvetica, sans-serif;
            }

            .receipt {
              width: 54mm;
              margin: 0 auto;
              padding: 1mm 0 3mm;
              font-size: 9.5px;
              line-height: 1.35;
              break-after: page;
              page-break-after: always;
            }

            .receipt:last-child {
              break-after: auto;
              page-break-after: auto;
            }

            .center {
              text-align: center;
            }

            .bold {
              font-weight: 800;
            }

            .title {
              font-size: 13px;
              margin-bottom: 1mm;
            }

            .line {
              border-top: 1px dashed #000;
              margin: 2mm 0;
            }

            .row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 2mm;
              margin: 0.8mm 0;
            }

            .test-name {
              flex: 1;
              overflow-wrap: anywhere;
            }

            .amount {
              white-space: nowrap;
              text-align: right;
            }

            .total {
              margin-top: 1.5mm;
              font-size: 12px;
              font-weight: 900;
            }

            .thank-you {
              margin-top: 2mm;
              font-weight: 700;
            }

            @media print {
              html,
              body {
                width: 58mm;
              }
            }
          </style>
        </head>

        <body>
          ${receiptHtml}

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.focus();
                window.print();
              }, 150);
            };
          <\/script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  function printGeneratedBill(
    patientId?: string
  ) {
    if (!generatedBill) return;

    printBillData(
      generatedBill,
      patientId
    );
  }

  if (!client) {
    return (
      <main className="min-h-screen bg-[#f5f9ff] px-5 py-10 text-[#07142f]">
        <div className="mx-auto max-w-xl rounded-[32px] bg-white p-8 shadow-xl">
          <Link
            href="/"
            className="mb-8 flex items-center gap-3 font-bold text-[#0754dc]"
          >
            <FaHome />
            Back to Home
          </Link>

          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#eef5ff] text-4xl text-[#0754dc]">
              <FaBuilding />
            </div>

            <h1 className="text-4xl font-extrabold">Client Portal</h1>

            <p className="mt-3 text-slate-500">
              Login to view price list, patient reports and enabled client tools.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block font-bold text-slate-600">
                Client Code
              </label>

              <input
                value={clientCode}
                onChange={(event) => setClientCode(event.target.value)}
                placeholder="Enter client code"
                className="w-full rounded-2xl border border-slate-200 p-4 text-lg font-bold outline-none focus:border-[#0754dc]"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-600">
                Login PIN
              </label>

              <input
                type="password"
                value={loginPin}
                onChange={(event) => setLoginPin(event.target.value)}
                placeholder="Enter PIN"
                className="w-full rounded-2xl border border-slate-200 p-4 text-lg font-bold outline-none focus:border-[#0754dc]"
              />
            </div>

            <button
              type="button"
              onClick={loginClient}
              disabled={loginLoading}
              className="w-full rounded-2xl bg-[#0754dc] px-6 py-4 text-lg font-extrabold text-white disabled:bg-slate-300"
            >
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f9ff] text-[#07142f]">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-5 px-6 py-5">
          <div>
            <p className="text-sm font-extrabold uppercase text-[#0754dc]">
              Client Portal
            </p>

            <h1 className="text-3xl font-extrabold">
              {getClientName(client)}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refreshData}
              className="flex items-center gap-2 rounded-xl bg-[#eef5ff] px-5 py-3 font-bold text-[#0754dc]"
            >
              <FaRedo />
              Refresh
            </button>

            <button
              type="button"
              onClick={logoutClient}
              className="flex items-center gap-2 rounded-xl bg-[#e71935] px-5 py-3 font-bold text-white"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-6 py-10">
        <div className="mb-8 rounded-[32px] bg-white p-7 shadow-sm">
          <div className="mb-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab("reports");
                setSearch("");
              }}
              className={`rounded-2xl px-6 py-4 text-lg font-extrabold ${
                activeTab === "reports"
                  ? "bg-[#0754dc] text-white"
                  : "bg-[#eef5ff] text-[#0754dc]"
              }`}
            >
              <FaFileMedical className="mr-2 inline" />
              Reports
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("priceList");
                setSearch("");
              }}
              className={`rounded-2xl px-6 py-4 text-lg font-extrabold ${
                activeTab === "priceList"
                  ? "bg-[#0754dc] text-white"
                  : "bg-[#eef5ff] text-[#0754dc]"
              }`}
            >
              <FaTable className="mr-2 inline" />
              Test Price List
            </button>

            {client.billing_enabled === true && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("billing");
                  setSearch("");
                }}
                className={`rounded-2xl px-6 py-4 text-lg font-extrabold ${
                  activeTab === "billing"
                    ? "bg-[#0754dc] text-white"
                    : "bg-[#eef5ff] text-[#0754dc]"
                }`}
              >
                <FaFileInvoiceDollar className="mr-2 inline" />
                Billing
              </button>
            )}

            {client.billing_enabled === true && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("pastBills");
                  setSearch("");
                }}
                className={`rounded-2xl px-6 py-4 text-lg font-extrabold ${
                  activeTab === "pastBills"
                    ? "bg-[#0754dc] text-white"
                    : "bg-[#eef5ff] text-[#0754dc]"
                }`}
              >
                <FaPrint className="mr-2 inline" />
                Past Bills
              </button>
            )}
          </div>

          <h2 className="text-4xl font-extrabold">
            {activeTab === "reports"
              ? "Patient Reports"
              : activeTab === "priceList"
                ? "Client Test Price List"
                : activeTab === "billing"
                  ? "Patient Billing"
                  : "Past Bills"}
          </h2>

          <p className="mt-3 text-lg font-semibold text-slate-500">
            {activeTab === "reports"
              ? "Download report PDFs uploaded by Cytocare."
              : activeTab === "priceList"
                ? "View Cytocare client/lab rates and patient MRP list."
                : activeTab === "billing"
                  ? "Create patient bills using your client-specific MRP rates."
                  : "View and reprint bills generated during the last 48 hours."}
          </p>

          {activeTab !== "billing" && (
            <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-[#f8fbff] px-5 py-4">
              <FaSearch className="text-[#0754dc]" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  activeTab === "reports"
                    ? "Search report by patient name, accession number or PDF filename..."
                    : "Search test name, category, vial or price..."
                }
                className="w-full bg-transparent text-lg font-bold text-[#07142f] outline-none placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {activeTab === "reports" && (
          <>
            {reportsLoading ? (
              <div className="rounded-3xl bg-white p-10 text-center text-xl font-extrabold shadow-sm">
                Loading reports...
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                <FaFileMedical className="mx-auto text-6xl text-[#0754dc]" />

                <h3 className="mt-6 text-2xl font-extrabold">
                  No reports found
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-slate-500">
                  Reports uploaded by Cytocare will appear here.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-2xl font-extrabold">
                    {filteredReports.length} Report
                    {filteredReports.length !== 1 ? "s" : ""}
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredReports.map((report) => (
                    <div
                      key={report.report_id}
                      className="rounded-[28px] bg-white p-6 shadow-sm"
                    >
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0f3] text-2xl text-[#e71935]">
                        <FaFileMedical />
                      </div>

                      <p className="text-xs font-extrabold uppercase text-[#0754dc]">
                        PDF Report
                      </p>

                      <h3 className="mt-2 break-words text-xl font-extrabold text-[#07142f]">
                        {report.file_name}
                      </h3>

                      <p className="mt-4 text-sm font-bold text-slate-500">
                        Uploaded: {formatDate(report.uploaded_at)}
                      </p>

                      {report.file_size > 0 && (
                        <p className="mt-1 text-sm font-semibold text-slate-400">
                          {(report.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}

                      <div className="mt-6 grid gap-3">
                        <a
                          href={report.report_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#0754dc] px-5 py-4 font-extrabold text-white"
                        >
                          <FaFileMedical />
                          View PDF
                        </a>

                        <button
                          type="button"
                          onClick={() => downloadAndOpenReport(report)}
                          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#05a832] px-5 py-4 font-extrabold text-white"
                        >
                          <FaDownload />
                          Download & Open
                        </button>

                        <button
                          type="button"
                          onClick={() => shareReport(report)}
                          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#07142f] px-5 py-4 font-extrabold text-white"
                        >
                          <FaShareAlt />
                          Share PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "priceList" && (
          <>
            {priceLoading ? (
              <div className="rounded-3xl bg-white p-10 text-center text-xl font-extrabold shadow-sm">
                Loading price list...
              </div>
            ) : filteredPriceList.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                <FaTable className="mx-auto text-6xl text-[#0754dc]" />

                <h3 className="mt-6 text-2xl font-extrabold">
                  No price list found
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-slate-500">
                  Client price list will appear here after it is added in
                  Supabase.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[32px] bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <h3 className="text-2xl font-extrabold">
                    {filteredPriceList.length} Tests Available
                  </h3>

                  <p className="mt-2 text-sm font-bold text-slate-500">
                    Client rates are visible only after client login.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-collapse">
                    <thead>
                      <tr className="bg-[#07142f] text-left text-sm text-white">
                        <th className="px-5 py-4">Test Name</th>
                        <th className="px-5 py-4">Category</th>
                        <th className="px-5 py-4">Vial</th>

                        {client.show_client_rate !== false && (
                          <th className="px-5 py-5 text-left">
                            Client Rate
                          </th>
                        )}

                        <th className="px-5 py-4">MRP</th>
                        <th className="px-5 py-4">Reporting Time</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPriceList.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-slate-100 align-top"
                        >
                          <td className="px-5 py-4 font-extrabold text-[#07142f]">
                            {item.product}
                          </td>

                          <td className="px-5 py-4 font-bold text-slate-600">
                            {item.category || "Not added"}
                          </td>

                          <td className="px-5 py-4 font-bold text-slate-600">
                            {item.vials || "Not added"}
                          </td>

                          {client.show_client_rate !== false && (
                            <td className="px-5 py-5 font-extrabold text-[#0754dc]">
                              {rupees(item.clientRate)}
                            </td>
                          )}

                          <td className="px-5 py-4 text-lg font-extrabold text-[#07142f]">
                            {rupees(item.mrp)}
                          </td>

                          <td className="px-5 py-4 font-bold text-slate-600">
                            {item.reportingTime || "Not added"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "billing" && client.billing_enabled === true && (
          <div className="space-y-7">
            {billingPatients.map((patient, patientIndex) => {
              const selectedTests = getPatientSelectedTests(patient);
              const gross = getPatientGross(patient);
              const discount = getPatientDiscount(patient);
              const finalAmount = getPatientFinal(patient);
              const testQuery = patient.testSearch.toLowerCase().trim();

              const visibleTests = priceList
                .filter((item) => {
                  if (!testQuery) return true;

                  return [item.product, item.category, item.vials]
                    .join(" ")
                    .toLowerCase()
                    .includes(testQuery);
                })
                .slice(0, testQuery ? 50 : 20);

              return (
                <div
                  key={patient.localId}
                  className="rounded-[30px] bg-white p-7 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                      <p className="text-sm font-extrabold uppercase text-[#0754dc]">
                        Patient {patientIndex + 1}
                      </p>

                      <h3 className="mt-1 text-3xl font-extrabold">
                        Patient Details
                      </h3>
                    </div>

                    {billingPatients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBillingPatient(patient.localId)}
                        className="flex items-center gap-2 rounded-xl bg-[#fff0f3] px-4 py-3 font-extrabold text-[#e71935]"
                      >
                        <FaTrash />
                        Remove Patient
                      </button>
                    )}
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                   <div>
  <label className="mb-2 block text-sm font-extrabold">
    Patient Name *
  </label>

  <input
    value={patient.patientName}
    onChange={(event) =>
      updateBillingPatient(patient.localId, {
        patientName: event.target.value,
      })
    }
    placeholder="Enter patient name"
    className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
  />
</div>

<div>
  <label className="mb-2 block text-sm font-extrabold">
    Sex *
  </label>

  <select
    value={patient.sex}
    onChange={(event) =>
      updateBillingPatient(patient.localId, {
        sex: event.target.value as
          | ""
          | "Male"
          | "Female"
          | "Other",
      })
    }
    className="w-full rounded-xl border border-slate-200 bg-white p-4 font-bold outline-none focus:border-[#0754dc]"
  >
    <option value="">Select Sex</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</div>

<div>
  <label className="mb-2 block text-sm font-extrabold">
    Age
  </label>

  <input
    type="number"
    min="0"
    max="120"
    value={patient.age}
    onChange={(event) =>
      updateBillingPatient(patient.localId, {
        age: event.target.value,
      })
    }
    placeholder="Age"
    className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
  />
</div>

<div>
  <label className="mb-2 block text-sm font-extrabold">
    Doctor Name
  </label>

  <input
    value={patient.doctorName}
    onChange={(event) =>
      updateBillingPatient(patient.localId, {
        doctorName: event.target.value,
      })
    }
    placeholder="Ref. doctor name"
    className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
  />
</div>

<div>
  <label className="mb-2 block text-sm font-extrabold">
    Mobile Number
  </label>

  <input
    inputMode="numeric"
    maxLength={10}
    value={patient.mobile}
    onChange={(event) =>
      updateBillingPatient(patient.localId, {
        mobile: event.target.value
          .replace(/\D/g, "")
          .slice(0, 10),
      })
    }
    placeholder="10-digit mobile"
    className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#0754dc]"
  />
</div>
                  </div>

                  <div className="mt-7 rounded-3xl bg-[#f8fbff] p-5">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-extrabold uppercase text-[#0754dc]">
                          Select Tests
                        </p>

                        <h4 className="mt-1 text-2xl font-extrabold">
                          Client MRP Billing
                        </h4>

                        <p className="mt-1 text-sm font-bold text-slate-500">
                          Patient billing uses this client's effective MRP.
                        </p>
                      </div>

                      <p className="rounded-xl bg-white px-4 py-3 font-extrabold text-[#0754dc]">
                        {selectedTests.length} selected
                      </p>
                    </div>

                    <div className="relative mt-5">
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0754dc]" />

                      <input
                        value={patient.testSearch}
                        onChange={(event) =>
                          updateBillingPatient(patient.localId, {
                            testSearch: event.target.value,
                          })
                        }
                        placeholder="Search test name..."
                        className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 font-bold outline-none focus:border-[#0754dc]"
                      />
                    </div>

                    <div className="mt-4 max-h-[370px] overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                      {priceLoading ? (
                        <p className="p-6 text-center font-bold text-slate-500">
                          Loading tests...
                        </p>
                      ) : visibleTests.length === 0 ? (
                        <p className="p-6 text-center font-bold text-slate-500">
                          No test found.
                        </p>
                      ) : (
                        visibleTests.map((item) => {
                          const checked =
                            patient.selectedPriceIds.includes(item.id);

                          return (
                            <label
                              key={item.id}
                              className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 hover:bg-[#f8fbff]"
                            >
                              <div className="flex min-w-0 items-center gap-4">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    toggleBillingTest(
                                      patient.localId,
                                      item.id
                                    )
                                  }
                                  className="h-5 w-5"
                                />

                                <div className="min-w-0">
                                  <p className="font-extrabold text-[#07142f]">
                                    {item.product}
                                  </p>

                                  <p className="mt-1 text-xs font-bold text-slate-400">
                                    {item.category || "Test"}
                                  </p>
                                </div>
                              </div>

                              <p className="shrink-0 text-lg font-extrabold text-[#0754dc]">
                                {rupees(item.mrp)}
                              </p>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {selectedTests.length > 0 && (
                    <div className="mt-6 rounded-3xl border border-slate-100 p-5">
                      <h4 className="text-xl font-extrabold">
                        Selected Tests
                      </h4>

                      <div className="mt-4 space-y-2">
                        {selectedTests.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-4 rounded-xl bg-[#f8fbff] px-4 py-3"
                          >
                            <p className="font-bold">{item.product}</p>
                            <p className="shrink-0 font-extrabold">
                              {rupees(item.mrp)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_390px]">
                    <div className="rounded-3xl bg-[#fff8df] p-5">
                      <label className="flex cursor-pointer items-center gap-3 font-extrabold text-[#7a4f00]">
                        <input
                          type="checkbox"
                          checked={patient.discountEnabled}
                          onChange={(event) =>
                            updateBillingPatient(patient.localId, {
                              discountEnabled: event.target.checked,
                              discountAmount: event.target.checked
                                ? patient.discountAmount
                                : "",
                            })
                          }
                          className="h-5 w-5"
                        />

                        Give Discount
                      </label>

                      {patient.discountEnabled && (
                        <div className="mt-4">
                          <label className="mb-2 block text-sm font-extrabold text-[#7a4f00]">
                            Discount Amount (₹)
                          </label>

                          <input
                            type="number"
                            min="0"
                            max={gross}
                            step="1"
                            value={patient.discountAmount}
                            onChange={(event) =>
                              updateBillingPatient(patient.localId, {
                                discountAmount: event.target.value,
                              })
                            }
                            placeholder="Enter discount amount"
                            className="w-full rounded-xl border border-[#d4af37]/40 bg-white p-4 font-extrabold outline-none focus:border-[#b77900]"
                          />

                          <p className="mt-2 text-xs font-bold text-[#7a4f00]">
                            Enter rupee amount only. No percentage discount.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="rounded-3xl bg-[#07142f] p-5 text-white">
                      <div className="flex justify-between gap-4">
                        <span className="font-bold text-slate-300">
                          Gross / Client MRP
                        </span>
                        <span className="font-extrabold">
                          {rupees(gross)}
                        </span>
                      </div>

                      {discount > 0 && (
                        <div className="mt-3 flex justify-between gap-4">
                          <span className="font-bold text-[#9ee7b0]">
                            Discount
                          </span>
                          <span className="font-extrabold text-[#9ee7b0]">
                            -{rupees(discount)}
                          </span>
                        </div>
                      )}

                      <div className="my-4 border-t border-dashed border-slate-500" />

                      <div className="flex items-end justify-between gap-4">
                        <span className="text-lg font-extrabold">
                          Billed Price
                        </span>

                        <span className="text-3xl font-extrabold">
                          {rupees(finalAmount)}
                        </span>
                      </div>

                      <div className="mt-5 border-t border-dashed border-slate-500 pt-5">
                        <label className="mb-2 block text-sm font-extrabold text-white">
                          Amount Paid by Patient (₹)
                        </label>

                        <input
                          type="number"
                          min="0"
                          max={finalAmount}
                          step="1"
                          value={patient.paidAmount}
                          onChange={(event) =>
                            updateBillingPatient(patient.localId, {
                              paidAmount: event.target.value,
                            })
                          }
                          placeholder="Enter paid amount"
                          className="w-full rounded-xl bg-white p-4 font-extrabold text-[#07142f] outline-none"
                        />

                        <div className="mt-4 flex justify-between gap-4">
                          <span className="font-bold text-slate-300">
                            Paid
                          </span>

                          <span className="font-extrabold text-[#9ee7b0]">
                            {rupees(getPatientPaid(patient))}
                          </span>
                        </div>

                        <div className="mt-3 flex justify-between gap-4">
                          <span className="font-bold text-slate-300">
                            Due
                          </span>

                          <span
                            className={`font-extrabold ${
                              getPatientDue(patient) > 0
                                ? "text-[#ff9da9]"
                                : "text-[#9ee7b0]"
                            }`}
                          >
                            {rupees(getPatientDue(patient))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addBillingPatient}
              disabled={billingSaving}
              className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-[#0754dc]/40 bg-white px-6 py-4 font-extrabold text-[#0754dc]"
            >
              <FaPlus />
              Add Another Patient
            </button>

            <div className="rounded-[30px] bg-white p-7 shadow-sm">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Billing Cycle Patients
                  </p>
                  <p className="mt-1 text-3xl font-extrabold">
                    {billingPatients.length}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Gross MRP
                  </p>
                  <p className="mt-1 text-3xl font-extrabold">
                    {rupees(billingTotals.gross)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Final Billed
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-[#05a832]">
                    {rupees(billingTotals.final)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Total Paid
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-[#05a832]">
                    {rupees(billingTotals.paid)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Total Due
                  </p>
                  <p
                    className={`mt-1 text-3xl font-extrabold ${
                      billingTotals.due > 0
                        ? "text-[#e71935]"
                        : "text-[#05a832]"
                    }`}
                  >
                    {rupees(billingTotals.due)}
                  </p>
                </div>
              </div>

              {billingTotals.discount > 0 && (
                <div className="mt-4 rounded-2xl bg-[#fff8df] p-4 font-extrabold text-[#7a4f00]">
                  Total Discount: -{rupees(billingTotals.discount)}
                </div>
              )}

              <button
                type="button"
                onClick={confirmBilling}
                disabled={
                  billingSaving ||
                  billingTotals.gross <= 0
                }
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#05a832] px-7 py-5 text-xl font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <FaPrint />

                {billingSaving
                  ? "Generating Bill..."
                  : "Generate & Print Bill"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "pastBills" && client.billing_enabled === true && (
          <div className="space-y-7">
            <div className="rounded-[30px] bg-white p-7 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-sm font-extrabold uppercase text-[#0754dc]">
                    Past Bills
                  </p>

                  <h3 className="mt-1 text-3xl font-extrabold">
                    Billing History
                  </h3>

                  <p className="mt-2 font-semibold text-slate-500">
                    Bills are available here for 48 hours from generation.
                  </p>
                </div>

                {billingHistoryDates.length > 0 && (
                  <div className="w-full max-w-sm">
                    <label className="mb-2 block text-sm font-extrabold">
                      Billing Date
                    </label>

                    <select
                      value={selectedBillingHistoryDate}
                      onChange={(event) =>
                        setSelectedBillingHistoryDate(
                          event.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 font-extrabold outline-none focus:border-[#0754dc]"
                    >
                      {billingHistoryDates.map((dateKey) => (
                        <option key={dateKey} value={dateKey}>
                          {formatBillingHistoryDate(dateKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {billingHistoryLoading ? (
                <div className="mt-6 rounded-2xl bg-[#f8fbff] p-6 text-center font-bold text-slate-500">
                  Loading previous bills...
                </div>
              ) : visibleBillingHistory.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-[#f8fbff] p-6 text-center">
                  <p className="font-extrabold text-slate-600">
                    No bills found in the last 48 hours.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {visibleBillingHistory.map((bill) => (
                    <div
                      key={bill.id}
                      className="rounded-3xl border border-slate-100 bg-[#f8fbff] p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-extrabold text-[#0754dc]">
                            Bill #{String(bill.serial_no).padStart(6, "0")}
                          </p>

                          <p className="mt-1 font-bold text-slate-500">
                            {formatDate(bill.created_at)} • {bill.total_patients} patient
                            {bill.total_patients !== 1 ? "s" : ""}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="rounded-xl bg-white px-4 py-3 text-right">
                            <p className="text-xs font-bold text-slate-500">
                              Billed
                            </p>

                            <p className="text-xl font-extrabold text-[#07142f]">
                              {rupees(bill.final_amount)}
                            </p>

                            <p className="mt-1 text-xs font-bold text-[#05a832]">
                              Paid {rupees(bill.paid_amount || 0)}
                            </p>

                            <p
                              className={`mt-1 text-xs font-bold ${
                                Number(bill.due_amount || 0) > 0
                                  ? "text-[#e71935]"
                                  : "text-[#05a832]"
                              }`}
                            >
                              Due {rupees(bill.due_amount || 0)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => printBillData(bill)}
                            className="flex items-center gap-2 rounded-xl bg-[#07142f] px-5 py-3 font-extrabold text-white"
                          >
                            <FaPrint />
                            Print 58mm
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {bill.patients.map((patient) => (
                          <div
                            key={patient.id}
                            className="rounded-2xl bg-white p-4"
                          >
                            <p className="font-extrabold">
                              {patient.patient_name}
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-500">
                              {patient.age !== null &&
                              patient.age !== undefined
                                ? `${patient.age} yrs • `
                                : ""}
                              {patient.sex || "-"}
                              {patient.mobile ? ` • ${patient.mobile}` : ""}
                            </p>

                            {patient.doctor_name && (
                              <p className="mt-1 text-sm font-bold text-slate-500">
                                Doctor: {patient.doctor_name}
                              </p>
                            )}

                            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                              <div className="rounded-lg bg-[#f8fbff] p-2">
                                <p className="text-xs font-bold text-slate-400">
                                  Bill
                                </p>
                                <p className="font-extrabold">
                                  {rupees(patient.final_amount)}
                                </p>
                              </div>

                              <div className="rounded-lg bg-[#eafff0] p-2">
                                <p className="text-xs font-bold text-[#057a28]">
                                  Paid
                                </p>
                                <p className="font-extrabold text-[#05a832]">
                                  {rupees(patient.paid_amount || 0)}
                                </p>
                              </div>

                              <div className="rounded-lg bg-[#fff0f3] p-2">
                                <p className="text-xs font-bold text-[#e71935]">
                                  Due
                                </p>
                                <p className="font-extrabold text-[#e71935]">
                                  {rupees(patient.due_amount || 0)}
                                </p>
                              </div>
                            </div>

                            <p className="mt-2 text-xs font-extrabold uppercase text-slate-500">
                              {patient.payment_status || "Due"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  printBillData(
                                    bill,
                                    patient.id
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg bg-[#eef5ff] px-3 py-2 text-sm font-extrabold text-[#0754dc]"
                              >
                                <FaPrint />
                                Print Patient
                              </button>

                              {Number(patient.due_amount || 0) > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentEditPatientId(
                                      paymentEditPatientId === patient.id
                                        ? ""
                                        : patient.id
                                    );
                                    setAdditionalPayment("");
                                  }}
                                  className="rounded-lg bg-[#fff8df] px-3 py-2 text-sm font-extrabold text-[#7a4f00]"
                                >
                                  Update Payment
                                </button>
                              )}
                            </div>

                            {paymentEditPatientId === patient.id && (
                              <div className="mt-4 rounded-xl border border-[#f3d384] bg-[#fffaf0] p-3">
                                <p className="text-xs font-bold text-[#7a4f00]">
                                  Due: {rupees(patient.due_amount || 0)}
                                </p>

                                <input
                                  type="number"
                                  min="1"
                                  max={patient.due_amount}
                                  value={additionalPayment}
                                  onChange={(event) =>
                                    setAdditionalPayment(event.target.value)
                                  }
                                  placeholder="Additional payment"
                                  className="mt-2 w-full rounded-lg border border-[#f3d384] bg-white p-3 font-extrabold outline-none"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    updatePastBillPayment(
                                      bill,
                                      patient
                                    )
                                  }
                                  disabled={
                                    paymentSavingPatientId === patient.id
                                  }
                                  className="mt-2 w-full rounded-lg bg-[#05a832] px-3 py-2 text-sm font-extrabold text-white disabled:bg-slate-300"
                                >
                                  {paymentSavingPatientId === patient.id
                                    ? "Saving..."
                                    : "Save Payment"}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </section>
    </main>
  );
}