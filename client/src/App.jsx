import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RideBooking from "./modules/rides/RideBooking";
import MyBookings from "./pages/MyBookings";
import FoodOrdering from "./modules/food/FoodOrdering";
import MovieBooking from "./modules/movies/MovieBooking";
import FlightBooking from "./modules/flights/FlightBooking";
import BusBooking from "./modules/bus/BusBooking";
import Shopping from "./modules/shop/Shopping";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rides" element={<RideBooking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/food" element={<FoodOrdering />} />
        <Route path="/movies" element={<MovieBooking />} />
        <Route path="/flights" element={<FlightBooking />} />
        <Route path="/buses" element={<BusBooking />} />
        <Route path="/shop" element={<Shopping />} />
      </Routes>
    </BrowserRouter>
  );
}