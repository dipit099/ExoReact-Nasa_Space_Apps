import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ExoShowDown.css";
import Navbar from "../../components/navbar/Navbar";
import SERVER_URL from "../../config/SERVER_URL";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SubNavbar from "../../components/navbar/SubNavbar";
import Footer from "../../components/footer/Footer";

function ExoShowDown() {
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [artFile, setArtFile] = useState(null);
  const [liveCompetitions, setLiveCompetitions] = useState([]);
  const [competitionJoined, setCompetitionJoined] = useState(false); // Handle competition join
  const [pastCompetitions, setPastCompetitions] = useState([]);
  const [upcomingCompetitions, setUpcomingCompetitions] = useState([]);
  const [view, setView] = useState("past");
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchOngoingCompetitions();
    fetchPastCompetitions();
    fetchUpcomingCompetitions();
  }, []);

  const fetchOngoingCompetitions = async () => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/exoshowdown/ongoing-showdown`
      );
      setLiveCompetitions(response.data.contests);
      calculateTimeLeft(response.data.contests[0].end_date); // Use the first ongoing competition for the countdown
    } catch (error) {
      console.error("Error fetching ongoing competitions:", error);
    }
  };

  const fetchPastCompetitions = async () => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/exoshowdown/past-showdown`
      );
      setPastCompetitions(response.data.contests);
    } catch (error) {
      console.error("Error fetching past competitions:", error);
    }
  };

  const fetchUpcomingCompetitions = async () => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/exoshowdown/upcoming-showdown`
      );
      setUpcomingCompetitions(response.data.contests);
    } catch (error) {
      console.error("Error fetching upcoming competitions:", error);
    }
  };

  // Countdown timer logic
  const calculateTimeLeft = (endDate) => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endDate);
      const timeRemaining = end - now;

      if (timeRemaining > 0) {
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft(null);
        clearInterval(interval);
      }
    }, 1000);
  };

  const handleFileChange = (e) => {
    setArtFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCompetition || !artFile) {
      toast.error("Please select a competition and upload an art file.");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("description", description);
    formData.append("artFile", artFile);
    formData.append("contestId", selectedCompetition.contest_id);
    formData.append("userId", localStorage.getItem("user_id"));

    try {
      console.log("FormData:", {
        caption,
        description,
        contestId: selectedCompetition.contest_id,
        artFile: artFile ? artFile.name : "No file selected",
        userId: localStorage.getItem("userId"),
      });

      // Uncomment the following line to send the request
      const response = await axios.post(
        `${SERVER_URL}/exoshowdown/upload-content`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Art upload response:", response.data);

      if (response.data.success) {
        toast.success("Art uploaded successfully!");
        setCaption("");
        setDescription("");
        setArtFile(null);
      }
      closePopup();
    } catch (error) {
      toast.error("Error uploading art");
      console.error("Error uploading art:", error);
    }
  };

  const handleJoin = (competition) => {
    setCompetitionJoined(true);
    setSelectedCompetition(competition);
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setCompetitionJoined(false); // Reset competitionJoined to false when closing the modal
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
    <>
      <Navbar />
      <SubNavbar />
      <div className="exoshowdown-container">
        <div className="exoShowdown-title">ExoShowDown: Art Competition</div>

        {/* Ongoing competitions */}
        {liveCompetitions.length > 0 && (
          <div className="ongoing-competitions">
            <h2>Ongoing Competitions</h2>
            {liveCompetitions.map((competition) => (
              <div key={competition.contest_id} className="competition">
                <h3>{competition.caption}</h3>
                <p>{competition.description}</p>
                <div className="right-side">
                  {timeLeft && (
                    <div className="countdown">
                      <strong>Remaining Time:</strong>
                      <p>
                        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
                        {timeLeft.seconds}s
                      </p>
                    </div>
                  )}
                  <div>
                    {!competitionJoined && (
                      <button
                        className="join-button"
                        onClick={() => handleJoin(competition)}
                      >
                        Register
                      </button>
                    )}
                    <button
                      className="leaderboard-button"
                      onClick={() =>
                        window.open(
                          `/exoshowGallery/${competition.contest_id}`,
                          "_blank"
                        )
                      }
                    >
                      Show Gallery
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Popup for submitting art */}
        {popupOpen && (
          <div className="popup-overlay">
            <div className="popup-content">
              <button className="close-button" onClick={closePopup}>
                ×
              </button>
              <h2>Submit Your Art</h2>
              <form onSubmit={handleSubmit} className="popup-form">
                <input
                  type="text"
                  placeholder="Enter caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  required
                  className="form-input"
                />
                <textarea
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="form-textarea"
                />
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  className="file-input"
                />
                <button type="submit" className="submit-button">
                  Submit Art
                </button>
              </form>
            </div>
          </div>
        )}

        {/* View toggle options */}
        <div className="competition-toggle">
          <button
            className={`toggle-button ${view === "past" ? "active" : ""}`}
            onClick={() => handleViewChange("past")}
          >
            Past Competitions
          </button>
          <button
            className={`toggle-button ${view === "upcoming" ? "active" : ""}`}
            onClick={() => handleViewChange("upcoming")}
          >
            Upcoming Competitions
          </button>
        </div>

        {/* Upcoming competitions */}
        {view === "upcoming" && (
          <div className="upcoming-competitions">
            <h2>Upcoming Art Competitions</h2>
            {upcomingCompetitions.length > 0 ? (
              upcomingCompetitions.map((competition) => (
                <div key={competition.contest_id} className="competition">
                  <h3>{competition.caption}</h3>
                  <p>{competition.description}</p>
                  <p>
                    <strong>Starts on:</strong>{" "}
                    {new Date(competition.start_date).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No upcoming competitions available.</p>
            )}
          </div>
        )}

        {/* Past competitions */}
        {view === "past" && (
          <div className="past-competitions">
            <h2>Gallery of Champions</h2>
            {pastCompetitions.length > 0 ? (
              pastCompetitions.map((competition) => (
                <div key={competition.contest_id} className="competition">
                  <h3>{competition.caption}</h3>
                  <p>{competition.description}</p>
                  <div className="time-leaderboard">
                    <div>
                      <p>
                        <strong>Start Date:</strong>{" "}
                        {new Date(competition.start_date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>End Date:</strong>{" "}
                        {new Date(competition.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      className="leaderboard-button"
                      onClick={() =>
                        window.open(
                          `/exoshowGallery/${competition.contest_id}`,
                          "_blank"
                        )
                      }
                    >
                      Show Gallery
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No past competitions available.</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default ExoShowDown;
