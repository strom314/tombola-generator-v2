import { useEffect, useMemo, useRef, useState } from "react";
import "./TicketDisplay.css";

const COLOR_SEQUENCE = ["red", "blue", "green", "yellow", "white"];
const COLOR_TO_HEX = {
  red: "#ef5350",
  blue: "#42a5f5",
  green: "#66bb6a",
  yellow: "#ffca28",
  white: "#ffffff",
};

function TicketDisplay({ ticket }) {
  const [displayedNumber, setDisplayedNumber] = useState(null);
  const [displayedVariant, setDisplayedVariant] = useState(null);
  const [isCycling, setIsCycling] = useState(false);
  const [cyclingColor, setCyclingColor] = useState(null);
  const [showFinalColor, setShowFinalColor] = useState(false);
  const previousColorRef = useRef(null);
  const intervalRef = useRef(null);
  const colorIntervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const colorTimeoutRef = useRef(null);
  const startTimeoutRef = useRef(null);
  const variantCycleRef = useRef("A");

  const ticketKey = useMemo(() => {
    if (!ticket) return null;
    return `${ticket.color}-${ticket.variant}-${ticket.number}`;
  }, [ticket]);

  const stopCycling = (finalNumber, finalVariant, finalColor) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (colorIntervalRef.current) {
      clearInterval(colorIntervalRef.current);
      colorIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDisplayedNumber(finalNumber);
    setDisplayedVariant(finalVariant);
    setIsCycling(false);

    // Nastaví finálnu farbu na overlay pred tým, než zmizne
    setCyclingColor(finalColor);

    // Po krátkom oneskorení nechá overlay zmiznieť a odkryje finálnu farbu pozadia
    colorTimeoutRef.current = setTimeout(() => {
      setShowFinalColor(true);
      // Ešte počkáme na dokončenie fade-out animácie
      setTimeout(() => {
        setCyclingColor(null);
        // Uloží finálnu farbu pre ďalšie kolo do ref (nie do state)
        previousColorRef.current = finalColor;
      }, 600);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (colorIntervalRef.current) clearInterval(colorIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (colorTimeoutRef.current) clearTimeout(colorTimeoutRef.current);
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!ticketKey) {
      stopCycling(null, null, null);
      setCyclingColor(null);
      setShowFinalColor(false);
      return;
    }

    // Vyčistíme všetky existujúce intervaly a timeouty pred začatím novej animácie
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (colorIntervalRef.current) clearInterval(colorIntervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);

    setIsCycling(true);
    setShowFinalColor(false);
    variantCycleRef.current = "A";

    // Number + variant fast cycling
    const numberInterval = setInterval(() => {
      const randomNumber = Math.floor(Math.random() * 100) + 1;
      variantCycleRef.current = variantCycleRef.current === "A" ? "B" : "A";
      setDisplayedNumber(randomNumber);
      setDisplayedVariant(variantCycleRef.current);
    }, 70);
    intervalRef.current = numberInterval;

    // Color smooth cycling
    const colors = COLOR_SEQUENCE;

    // Začne z predchádzajúcej farby (ak existuje) alebo z prvej farby v sekvencii
    let colorIndex = 0;
    const previousColor = previousColorRef.current;
    if (previousColor) {
      // Nájde index predchádzajúcej farby v sekvencii
      const prevIndex = colors.indexOf(previousColor);
      if (prevIndex !== -1) {
        colorIndex = prevIndex;
      }
      // Nastaví overlay okamžite na predchádzajúcu farbu pred začatím animácie
      setCyclingColor(previousColor);
    } else {
      setCyclingColor(colors[colorIndex]);
    }

    // Malé oneskorenie pred začatím cyklovania, aby bola viditeľná prvá farba
    startTimeoutRef.current = setTimeout(() => {
      const colorInterval = setInterval(() => {
        colorIndex = (colorIndex + 1) % colors.length;
        setCyclingColor(colors[colorIndex]);
      }, 900);
      colorIntervalRef.current = colorInterval;

      timeoutRef.current = setTimeout(() => {
        // stop both intervals
        clearInterval(numberInterval);
        clearInterval(colorInterval);
        intervalRef.current = null;
        colorIntervalRef.current = null;
        stopCycling(ticket.number, ticket.variant, ticket.color);
      }, 2000);
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (colorIntervalRef.current) clearInterval(colorIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (colorTimeoutRef.current) clearTimeout(colorTimeoutRef.current);
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    };
  }, [ticketKey, ticket?.number, ticket?.variant, ticket?.color]);

  if (!ticket) {
    return (
      <div className="ticket-display empty">
        <div className="ticket-content">
          <p>Nebol vylosovaný žiaden lístok</p>
          <p className="subtitle">Stlačte tlačidlo pre losovanie lístka</p>
        </div>
      </div>
    );
  }

  const finalNumber = displayedNumber ?? ticket.number;
  const finalVariant = displayedVariant ?? ticket.variant;
  const displayClassName = `ticket-display ${
    showFinalColor ? `color-${ticket.color}` : "cycling-neutral"
  }${isCycling ? " cycling" : ""}`;

  return (
    <div className={displayClassName}>
      {/* Smooth color overlay that shows cycling colors */}
      <div
        className={`color-fader${
          (isCycling || !showFinalColor) && cyclingColor ? " visible" : ""
        }`}
        style={{
          backgroundColor: cyclingColor
            ? COLOR_TO_HEX[cyclingColor]
            : "transparent",
        }}
        aria-hidden
      />
      <div className="ticket-content">
        <div className="ticket-number" aria-live="polite">
          {String(finalNumber).padStart(2, "0")}
        </div>
        <div className="ticket-variant" aria-live="polite">
          {finalVariant}
        </div>
      </div>
    </div>
  );
}

export default TicketDisplay;
