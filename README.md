# Setu Bharat AI #

# Overview

Setu is an AI‑powered communication mediator designed to improve communication between students, parents, and teachers.

In educational environments, emotional misunderstandings often create communication gaps. Students may express frustration, parents may react emotionally, and teachers may misinterpret the tone of messages.

Setu addresses this problem by using AI to analyze and reframe emotionally charged messages into constructive and respectful communication.

The system acts as a neutral mediator that helps users express their concerns clearly while maintaining a positive and solution‑oriented tone.


-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Problem Statement

Communication between students, parents, and teachers can sometimes become emotionally charged or misunderstood.

Common challenges include:

Students struggling to express concerns respectfully

Parents misinterpreting emotional messages

Teachers receiving feedback that sounds confrontational

Escalation of small issues into conflicts


These communication gaps can negatively affect the educational environment.


-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Solution

Setu introduces an AI‑mediated communication layer.

When a user submits a message, the system analyzes the tone and emotional context using AI and converts the message into a more constructive and respectful form.

This helps ensure that communication remains clear, respectful, and solution‑focused.


-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Key Features

AI‑powered message reframing

Secure user authentication

Role‑based interaction (Student / Parent / Teacher)

Simple and intuitive web interface

Constructive communication output



-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Technology Stack

Frontend & Deployment

The web application is deployed using
Vercel, which enables fast and reliable hosting for modern web applications.

Authentication & Security

User authentication and session management are handled by
Firebase.

Firebase ensures secure login and protects user data.

AI Processing

Message analysis and reframing are performed using the
**Google Gemini API.

Gemini analyzes the emotional tone of the message and rewrites it into constructive communication.


-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# System Workflow

The application follows the workflow below:

1. User opens the web application


2. User creates an account or logs in


3. User selects their role (Student, Parent, or Teacher)


4. User enters a message describing their concern


5. The message is sent to the AI system


6. Gemini analyzes and reframes the message


7. The constructive version is displayed to the user




-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Example

Input Message

> "I am tired of getting scolded in class all the time."



AI‑Reframed Output

> "I sometimes feel discouraged when I get scolded in class. I would appreciate guidance on how I can improve."



This transformation helps maintain respectful communication while still expressing the user’s concerns.


-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Architecture Overview

The system architecture includes three main layers:

User Interface Layer

Web interface where users interact with the platform.


Backend & Authentication Layer

Firebase handles authentication and security.


AI Processing Layer

Gemini API analyzes and reframes messages.


This layered architecture ensures scalability, security, and efficient AI processing.


-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Future Improvements

AI‑Generated Student Performance Reports

Teachers could upload or input student performance data into the system. Using AI powered by Google Gemini, the platform could automatically generate clear and personalized summaries of each student’s progress.
These reports could then be sent directly to parents, reducing the need for frequent routine parent‑teacher meetings while ensuring that parents remain informed about their child’s academic performance.

The platform can be expanded with several additional features to enhance communication in educational environments.

Possible future enhancements include:

Voice‑to‑text communication

Sentiment detection visualization

Multi‑language communication support

Conversation history tracking

Integration with school communication system

Integration with scalable cloud services such as Amazon Web Services

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Impact

Setu demonstrates how AI can be used to bridge communication gaps in education.

By transforming emotional messages into constructive dialogue, the platform helps create a more supportive and collaborative educational environment.


-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Contributors

Project developed by the Setu team.
