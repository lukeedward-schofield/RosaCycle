# RosaCycle Development Log

This document records the evolution of RosaCycle from concept to implementation. Every major architectural and product decision is documented so that future contributors understand **why** decisions were made, not just **what** was implemented.

---

# Development Phase 1 - Product Planning & System Design

Status: In Progress

## Objective

Before writing code, the team agreed to fully define the product, its architecture, and its business rules. The goal is to minimize redesign during development by understanding the product first and treating code as the implementation of an already well-defined system.

---

# Product Philosophy

RosaCycle is designed around the principles of the circular economy.

Instead of focusing on buying and selling recyclable materials, RosaCycle encourages communities to keep reusable materials circulating through trading, discovery, and recovery.

The project primarily supports **Sustainable Development Goal 12 – Responsible Consumption and Production** by extending the lifecycle of reusable materials before they reach landfills.

Core principles established during planning:

- Materials should continue circulating instead of becoming landfill waste.
- Money is intentionally removed from the exchange process.
- The platform targets environmentally conscious users and local communities.
- AI should reduce friction rather than replace user decision-making.
- Every feature should reinforce the circular flow of materials.

---

# Development Methodology

The team agreed that every feature will be designed using the following process:

```
Problem Definition
        ↓
Product Discussion
        ↓
Business Rules
        ↓
Edge Cases
        ↓
Architecture
        ↓
Database Design
        ↓
API Design
        ↓
UI / UX
        ↓
Implementation
```

The objective is to understand the business before writing code.

---

# Documentation Structure

The following project documentation was established before implementation:

- Product Definition
- Product Requirements
- System Architecture
- Database Design
- API Documentation
- UI / UX Documentation
- Project Management

This documentation serves as the project's single source of truth throughout development.

---

# Repository Structure

The project will use a monorepo architecture.

```
RosaCycle/

frontend/

backend/

docs/


```

The frontend and backend are developed independently while sharing the same repository and documentation.

---

# Backend Architecture Decision

Instead of organizing the backend by technical layers (controllers, services, repositories), the project will adopt a **feature-based architecture**.

Example:

```
backend/

auth/

user/

trade/

offer/

chat/

resource_spot/

shared/
```

Each feature contains its own models, controllers, services, repositories, and schemas to improve maintainability and reduce context switching for new developers.

---

# Trading System Design

The trading system was intentionally simplified to fit the hackathon timeline.

Business rules established:

- A trade represents one listing created by a user.
- A trade can only have one active offer at a time.
- The first successful offer reserves the trade.
- While reserved, no other users may submit offers.
- The trade owner may accept or decline the offer.
- Declining the offer makes the trade available again.
- Each offer belongs exclusively to one trade.
- Offer data is local to the trade and is not reused across different trades.

The possibility of allowing multiple concurrent offers was discussed but intentionally postponed due to development constraints.

---

# User Entity Design

The User entity is responsible only for identity and authentication.

Relationships such as trades, offers, and messages are handled separately.

Initial fields discussed include:

- User ID
- Username
- First Name
- Last Name
- Email
- Password Hash
- Profile Image
- Created Date
- User Role

Additional profile information such as addresses, biographies, and phone numbers were intentionally excluded from the MVP.

---

# Resource Discovery System

One of RosaCycle's defining features is the Resource Discovery system.

During planning, the feature evolved from the idea of reporting garbage dumps into reporting reusable community resources.

Terminology decision:

- ❌ Garbage Report
- ✅ Resource Spot

A Resource Spot represents a location containing reusable materials that community members may recover before they become landfill waste.

Current business rules:

- Users may report reusable resource locations.
- AI performs an initial material assessment.
- Users may edit AI-generated information before submission.
- Each report appears as a pin on the community map.
- Resource Spots may include permission information supplied by the reporter.
- Reports expire automatically after a configurable number of days.
- Community members may update the location by submitting a new photo after collecting materials.
- Once the location is completely depleted, users may mark the Resource Spot as collected, removing it from the map.

The team intentionally decided not to treat Resource Spots as marketplace listings.

Instead, they function as community-discovered opportunities for material recovery.

---

# AI Philosophy

Throughout planning, AI was positioned as an assistant rather than an authority.

The agreed principles are:

- AI reduces manual data entry.
- AI suggestions are editable by users.
- AI estimates should never be treated as absolute truth.
- User verification always overrides AI predictions.

---

# Infrastructure Decisions

The project will use:

Frontend

- React
- Vite

Backend

- Flask
- SQLAlchemy

Database

- PostgreSQL

Hosting

- Railway

The database schema will be managed entirely through SQLAlchemy models and migrations rather than manual modifications within the hosting platform.

---

# Planning Philosophy

A recurring design principle established throughout planning:

> "Design the business first. Code is only the implementation."

Every major feature is challenged through discussion before implementation begins.

Questions considered include:

- Does the feature solve a real problem?
- Is it technically feasible within the hackathon timeline?
- Does it support RosaCycle's mission?
- What are its edge cases?
- Can the architecture scale without unnecessary complexity?

---

# Current Progress

Completed

- Product Definition
- Product Requirements
- Documentation Structure
- Repository Structure
- Backend Architecture
- Initial Trading Design
- Initial User Entity Design
- Initial Resource Spot Design
- Infrastructure Decisions

Currently Working On

- Database Design

Upcoming

- Entity Relationships
- API Specification
- Frontend Architecture
- UI Components
- Implementation
- Testing



# Development Phase 2 - Development
