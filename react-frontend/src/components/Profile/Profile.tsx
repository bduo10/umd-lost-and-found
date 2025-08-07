import './Profile.css'
import { useState } from 'react';

export default function Profile() {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [terpsHelp, setTerpsHelp] = useState<number>(0);

    return (
        <div className="profile">
            <h2>{firstName} {lastName}</h2>
            <label>Terps Helped: {terpsHelp}</label>
        </div>
    );
}