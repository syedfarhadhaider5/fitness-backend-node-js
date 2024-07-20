const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const { Configuration, OpenAI } = require('openai');

// Initialize OpenAI client

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY, // Make sure to set this in your environment variables
});

// Route to handle POST requests to /messages
router.post('/', async (req, res) => {
    try {
        const { question, time, date } = req.body;
        if (!question) {
            return res.status(400).send('Question is required');
        }
        if (!time) {
            return res.status(400).send('Time is required');
        }
        if (!date) {
            return res.status(400).send('Date is required');
        }

        // Call OpenAI API for the first prompt
        const prompt = 'Behave like a professional fitness trainer, I want to save the response in div, li, h3 and h3 color #f9c604.';

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: question }
            ],
        });
        const answerResponse = response.choices[0].message.content.trim();

        const answer = answerResponse;
        // Create a new message with a dummy answer
        const message = new Message({
            question,
            answer,
            time,
            date
        });

        await message.save();
        res.status(201).json({ message: 'Message saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
// Route to handle GET requests to /messages
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find();
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


// Route to handle PUT requests to /messages/:id to update seen flag
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.seen = true; // Update the seen flag to true
        await message.save();

        res.status(200).json({ message: 'Message updated successfully', data: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Route to handle PUT requests to /messages/:id to update flag field
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.flag = "seen"; // Update the flag field to seen
        await message.save();

        res.status(200).json({ message: 'Message updated successfully', data: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

router.post('/translate', async (req, res) => {
    const language = req.body.language; // Language input from frontend

    if (!language) {
        return res.status(400).send('Language is required');
    }

    try {
        // Fetch all messages (questions and answers) from the database
        const messages = await Message.find({});

        for (const message of messages) {
            const question = message.question;
            const answer = message.answer;

            // Translate question
            const resultQuestion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: `Translate to ${language}: ${question}` },
                ],
            });

            // Translate answer
            const resultAnswer = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: `Translate to ${language}: ${answer}` },
                ],
            });

            // Assuming `choices[0].message.content` contains the translated texts
            const translatedQuestion = resultQuestion.choices[0].message.content.trim();
            const translatedAnswer = resultAnswer.choices[0].message.content.trim();

            // Update the message record with translated content
            message.question = translatedQuestion;
            message.answer = translatedAnswer;
            await message.save();
        }

        res.status(200).json({ success: true, message: 'Translation and update successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error: ' + error.message });
    }
});

module.exports = router;
