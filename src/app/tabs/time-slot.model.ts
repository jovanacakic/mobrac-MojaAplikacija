export interface TimeSlot {
  status: string;
  id : string;
  index : string;
  date?: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
