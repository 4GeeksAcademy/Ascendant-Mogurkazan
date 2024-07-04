import React, { useContext, useState } from "react";
import axios from "axios";
import { Context } from "../store/appContext";
import "../../styles/home.css";

export const Home = () => {
    const { store, actions } = useContext(Context);
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [time, setTime] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [response, setResponse] = useState("");

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    // Generar opciones de tiempo combinando horas y minutos
    const generateTimeOptions = () => {
        const times = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) { // Incrementos de 15 minutos
                const hour = h.toString().padStart(2, '0');
                const minute = m.toString().padStart(2, '0');
                times.push(`${hour}:${minute}`);
            }
        }
        return times;
    };

    const timeOptions = generateTimeOptions();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.BACKEND_URL}/api/ask`, {
                day,
                month,
                year,
                time,
                city,
                country
            });
            setResponse(res.data.response);
        } catch (error) {
            console.error("Error asking question:", error);
        }
    };

    return (
        <div className="text-center mt-5">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="day" className="form-label">Day</label>
                    <select 
                        id="day" 
                        className="form-control" 
                        value={day} 
                        onChange={(e) => setDay(e.target.value)}
                    >
                        <option value="">Select Day</option>
                        {days.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="month" className="form-label">Month</label>
                    <select 
                        id="month" 
                        className="form-control" 
                        value={month} 
                        onChange={(e) => setMonth(e.target.value)}
                    >
                        <option value="">Select Month</option>
                        {months.map((m, index) => (
                            <option key={index} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="year" className="form-label">Year</label>
                    <input 
                        type="text" 
                        id="year" 
                        className="form-control" 
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="time" className="form-label">Time</label>
                    <select 
                        id="time" 
                        className="form-control" 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)}
                    >
                        <option value="">Select Time</option>
                        {timeOptions.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="city" className="form-label">City</label>
                    <input 
                        type="text" 
                        id="city" 
                        className="form-control" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="country" className="form-label">Country</label>
                    <input 
                        type="text" 
                        id="country" 
                        className="form-control" 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>

            {response && (
                <div className="mt-5">
                    <h2>Result</h2>
                    <p>{response}</p>
                </div>
            )}

            <div className="alert alert-info mt-3">
                {store.message || "Loading message from the backend (make sure your python backend is running)..."}
            </div>
            <p>
                This boilerplate comes with lots of documentation:{" "}
                <a href="https://start.4geeksacademy.com/starters/react-flask">
                    Read documentation
                </a>
            </p>
        </div>
    );
};
