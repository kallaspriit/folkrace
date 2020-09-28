import { config } from "../config";
import { TrackedVehicleKinematics } from "../lib/tracked-vehicle-kinematics";

export const kinematics = new TrackedVehicleKinematics(config.vehicle);
