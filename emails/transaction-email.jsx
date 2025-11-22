import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

export default function TransactionEmail({
    userName = "User",
    type = "EXPENSE",
    amount = 0,
    description = "Transaction",
    category = "General",
    date = new Date(),
    accountName = "Account",
    newBalance = 0,
    aiInsight = "Keep up the good work!",
}) {
    const isExpense = type === "EXPENSE";
    const color = isExpense ? "#ef4444" : "#22c55e"; // Red for expense, Green for income

    return (
        <Html>
            <Head />
            <Preview>
                {isExpense ? "💸 You spent" : "💰 You received"} {amount} on {description}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Welth Alert 🔔</Heading>

                    <Section style={{ ...box, borderColor: color }}>
                        <Text style={paragraph}>Hi {userName},</Text>
                        <Text style={paragraph}>
                            A new <strong>{type.toLowerCase()}</strong> was recorded on your <strong>{accountName}</strong>.
                        </Text>

                        <Section style={statContainer}>
                            <Text style={statLabel}>Amount</Text>
                            <Text style={{ ...statValue, color }}>
                                {isExpense ? "-" : "+"}₹{amount}
                            </Text>
                        </Section>

                        <Section style={detailsContainer}>
                            <Text style={detailRow}>
                                <strong>Merchant:</strong> {description}
                            </Text>
                            <Text style={detailRow}>
                                <strong>Category:</strong> {category}
                            </Text>
                            <Text style={detailRow}>
                                <strong>Date:</strong> {new Date(date).toLocaleDateString()}
                            </Text>
                        </Section>

                        <Section style={balanceContainer}>
                            <Text style={balanceLabel}>Current Balance</Text>
                            <Text style={balanceValue}>₹{newBalance}</Text>
                        </Section>

                        {/* AI Insight Section */}
                        <Section style={aiContainer}>
                            <Text style={aiLabel}>🧠 AI Twin Insight:</Text>
                            <Text style={aiText}>"{aiInsight}"</Text>
                        </Section>

                    </Section>

                    <Text style={footer}>
                        Sent by Welth AI • Your Financial Guardian
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    maxWidth: "600px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
};

const h1 = {
    color: "#1a1a1a",
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "40px",
    margin: "0 0 20px",
    textAlign: "center",
};

const box = {
    padding: "24px",
    borderRadius: "8px",
    borderTop: "4px solid",
    margin: "0 24px",
};

const paragraph = {
    color: "#525f7f",
    fontSize: "16px",
    lineHeight: "24px",
    textAlign: "left",
};

const statContainer = {
    textAlign: "center",
    margin: "32px 0",
};

const statLabel = {
    color: "#8898aa",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "8px",
};

const statValue = {
    fontSize: "36px",
    fontWeight: "700",
    margin: "0",
};

const detailsContainer = {
    backgroundColor: "#f9fafb",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "24px",
};

const detailRow = {
    color: "#525f7f",
    fontSize: "14px",
    margin: "4px 0",
};

const balanceContainer = {
    borderTop: "1px solid #e6ebf1",
    paddingTop: "16px",
    textAlign: "center",
};

const balanceLabel = {
    color: "#8898aa",
    fontSize: "12px",
    textTransform: "uppercase",
    marginBottom: "4px",
};

const balanceValue = {
    color: "#1a1a1a",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0",
};

const aiContainer = {
    marginTop: "24px",
    backgroundColor: "#eff6ff",
    padding: "16px",
    borderRadius: "8px",
    borderLeft: "4px solid #3b82f6",
};

const aiLabel = {
    color: "#1e40af",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: "8px",
};

const aiText = {
    color: "#1e3a8a",
    fontSize: "14px",
    fontStyle: "italic",
    margin: "0",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "center",
    marginTop: "32px",
};
