import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SERVER_URL from '../../config/SERVER_URL';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function QuizInfo({ userId }) {
    const [quizData, setQuizData] = useState([]);

    useEffect(() => {
        const fetchQuizInfo = async () => {
            try {
                // const response = await axios.post(`${SERVER_URL}/profile/quiz-info`, { userId });
                // toast.success('Quiz info fetched successfully');
                const response = await axios.get(`${SERVER_URL}/forum/${userId}`);
                console.log("forum collection",response.data);
                
               
            } catch (error) {
                console.error('Error fetching quiz info:', error.response?.data || error.message);
                toast.error('Error fetching quiz info');
            }
        };
        fetchQuizInfo();
    }, [userId]);

    if (!quizData.length) return <p className="no-quiz-message">No quiz info available</p>;

    return (
        <div className="quiz-info-section">
            <h3 className="section-title">Quiz Info</h3>
            <div className="quiz-items-grid">
                {quizData.map((quiz) => (
                    <div key={quiz.quizId} className="quiz-item-card">
                        <p className="quiz-title">{quiz.title}</p>
                        <p className="quiz-score">Score: {quiz.score}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default QuizInfo;
