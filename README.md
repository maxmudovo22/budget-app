<div align="center">

<img src="./assets/cover.png" alt="FinTrack MX Cover" width="100%" />

# FinTrack MX

### Personal Budget Assistant for Telegram Mini App

A clean, fast and smart digital assistant for tracking income, expenses and personal financial discipline.

<br/>

[![Live Demo](https://img.shields.io/badge/Live-Demo-111111?style=for-the-badge&logo=githubpages&logoColor=white)](https://maxmudovo22.github.io/budget-app/)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot-229ED9?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/fintrackmxbot)
[![Made with](https://img.shields.io/badge/Made%20with-Gemini_AI-ffffff?style=for-the-badge&logo=google&logoColor=black)](#)

</div>

---

## Overview

**FinTrack MX** is a digital budget assistant designed to help users manage personal finances directly inside Telegram.

The project focuses on simplicity, clean interface and fast access to core financial actions: adding expenses, tracking income, viewing balance and understanding spending behavior.

---

## Preview

<div align="center">

<img src="./assets/preview.png" alt="App Preview" width="85%" />

</div>

---

## Key Features

| Feature | Description |
|---|---|
| Expense Tracking | Add and control daily spending |
| Income Tracking | Save income records and calculate total balance |
| Budget Overview | View financial summary in a clean dashboard |
| Telegram Mini App | Works directly inside Telegram |
| Simple UI | Minimal, modern and mobile-friendly interface |
| AI-ready Structure | Can be extended with Gemini AI features |

---

## Project Architecture

```mermaid
flowchart TD
    A[User] --> B[Telegram Bot]
    B --> C[Telegram Mini App]
    C --> D[Budget Interface]
    D --> E[Income & Expense Data]
    E --> F[Analytics / Summary]
    F --> G[Better Financial Decisions]

