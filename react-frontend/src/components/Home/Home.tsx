import './Home.css';
import testudoIMG from '../../assets/testudo.jpg';

export default function Home() {
  return (
    <div className="home">
        <div className="home-content">
            <div className="home-text">
                <h1>Welcome to the University of Maryland Lost & Found!</h1>
                <p>
                    This website acts as the unofficial hub for lost and 
                    found items for the school. If you find a lost item, make a post on the 
                    feed to help the owner find it! If you're looking for your lost item, 
                    check the feed to see if someone has found it. 
                </p>
            </div>
            <img src={testudoIMG} alt="Testudo" className="testudo-image"/>
        </div>
    </div>
  );
}