export class WellnessShift {
    id: string;
    cafeId: string;
    startTime: Date;
    endTime: Date;

    constructor(id: string, cafeId: string, startTime: Date, endTime: Date) {
        this.id = id;
        this.cafeId = cafeId;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    isShiftValid(): boolean {
        return this.startTime < this.endTime;
    }
}