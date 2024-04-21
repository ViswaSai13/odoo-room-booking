import { Component } from '@angular/core';
import { BookingService } from './service.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  searchQuery = '';

  showFiltersFlag = false;
  showBookingFlag = false;
  showSlotsFlag = false;

  selectedRoom = null;

  minDate: Date = new Date();
  maxDate: Date = new Date();
  selectedDate: string = null;

  filtersObj = {
    seatCount: 0,
    features: [],
  };

  currentTimeSlot = null;
  currentDate = null;

  currentUserId = '1';
  userIdInput = '1';
  roomsList = [];
  defaultSlotMap = {
    1: {
      slot: 1,
      time: '10:00 - 10:30',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    2: {
      slot: 2,
      time: '10:30 - 11:00',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    3: {
      slot: 3,
      time: '11:00 - 11:30',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    4: {
      slot: 4,
      time: '11:30 - 12:00',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    5: {
      slot: 5,
      time: '12:00 - 12:30',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    6: {
      slot: 6,
      time: '12:30 - 1:00',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    7: {
      slot: 7,
      time: '1:00 - 1:30',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    8: {
      slot: 8,
      time: '1:30 - 2:00',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    9: {
      slot: 9,
      time: '2:00 - 2:30',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    10: {
      slot: 10,
      time: '2:30 - 3:00',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    11: {
      slot: 11,
      time: '3:00 - 3:30',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    12: {
      slot: 12,
      time: '3:30 - 4:00',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    13: {
      slot: 13,
      time: '4:00 - 4:30',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    14: {
      slot: 14,
      time: '4:30 - 5:00',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    15: {
      slot: 15,
      time: '5:00 - 5:30',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    16: {
      slot: 16,
      time: '5:30 - 6:00',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    17: {
      slot: 17,
      time: '6:00 - 6:30',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
    18: {
      slot: 18,
      time: '6:30 - 7:00',
      available: true,
      self: false,
      default: false,
      disabled: false,
    },
  };

  slotMap = JSON.parse(JSON.stringify(this.defaultSlotMap));

  bookingsData = [];

  newBookings = [];
  deletions = [];

  faclitiesArr = [];

  constructor(private _bookingService: BookingService) {
    this.setCurrentTimeSlot();
    this.getRoomsList();
    this.getFacilities();
    this.maxDate.setDate(this.minDate.getDate() + 60);
  }

  setCurrentTimeSlot() {
    let pDate = new Date();

    this.currentDate = this.formatLocalISODate(pDate);

    let pHrs = pDate.getHours();
    let pMins = pDate.getMinutes();

    // fix from and to hrs for the current time slot
    let fromHrs = pHrs;
    let toHrs = pMins >= 30 ? fromHrs + 1 : fromHrs;

    // format hrs to am pm format
    fromHrs = fromHrs % 12;
    fromHrs = fromHrs ? fromHrs : 12;
    toHrs = toHrs % 12;
    toHrs = toHrs ? toHrs : 12;

    // fix from and to mins for the current time slot
    let fromMins = pMins >= 30 ? '30' : '00';
    let toMins = pMins >= 30 ? '00' : '30';
    let timeString = `${fromHrs}:${fromMins} - ${toHrs}:${toMins}`;

    Object.values(this.defaultSlotMap).forEach((item) => {
      if (item.time == timeString) {
        this.currentTimeSlot = item.slot;
      }
    });
  }

  getAvailability(roomId) {
    return this._bookingService.getAvailability(
      roomId,
      this.currentTimeSlot,
      this.currentDate
    );
  }

  getFacilities() {
    this.faclitiesArr = [];
    this._bookingService.getFacilities().subscribe((res) => {
      Object.entries(res).forEach((ele) => {
        this.faclitiesArr.push({
          id: ele[0],
          title: ele[1],
          checked: false,
        });
      });
    });
  }

  getRoomsList() {
    let reqBody = {
      searchString: this.searchQuery,
      filters: this.filtersObj,
    };
    this._bookingService.getRooms(reqBody).subscribe((res) => {
      this.roomsList = res;
      this.roomsList.forEach((room) => {
        this.getAvailability(room._id).subscribe((res) => {
          room.status = res;
          if (room.status.nextAvailableDate == this.currentDate) {
            if (room.status.nextAvailableSlot == this.currentTimeSlot) {
              room.status.text = 'Currently available';
            } else {
              let difference =
                room.status.nextAvailableSlot - this.currentTimeSlot;
              let hrs = Math.floor(difference / 2)
                ? `${Math.floor(difference / 2)} hr(s)`
                : '';
              let mins = difference % 2 ? '30 mins' : '';
              room.status.text = `Available after ${hrs} ${mins}`;
            }
          } else {
            if (
              room.status.nextAvailableDate.split('-')[2] -
                this.currentDate.split('-')[2] ==
              1
            ) {
              room.status.text = 'Available tomorrow';
            } else if (
              room.status.nextAvailableDate.split('-')[2] -
                this.currentDate.split('-')[2] ==
              2
            ) {
              room.status.text = 'Available day after tomorrow';
            } else {
              room.status.text = `Available on ${room.status.nextAvailableDate}`;
            }
          }
        });
      });
    });
  }

  toggleSlot(slot) {
    if (!slot.value.available && !slot.value.self) {
      return;
    }
    slot.value.available = !slot.value.available;
    slot.value.self = true;
    this.newBookings = Object.values(this.slotMap).filter(
      (a) => a['self'] && !a['available'] && !a['default']
    );
    this.deletions = Object.values(this.slotMap).filter(
      (a) => a['self'] && a['available'] && a['default']
    );
  }

  selectRoom(roomObj) {
    if (roomObj && Object.keys(roomObj).length) {
      this.selectedRoom = roomObj;
      this.showBookingFlag = true;
    }
    this.showSlotsFlag = false;
    this.selectedDate = null;
  }

  changeDate(param) {
    this.selectedDate = this.formatLocalISODate(param);
    if (this.selectedDate == this.currentDate) {
      Object.keys(this.defaultSlotMap).forEach((key) => {
        if (key < this.currentTimeSlot) {
          this.defaultSlotMap[key].disabled = true;
        }
      });
    } else {
      Object.keys(this.defaultSlotMap).forEach((key) => {
        this.defaultSlotMap[key].disabled = false;
      });
    }
    this.slotMap = JSON.parse(JSON.stringify(this.defaultSlotMap));
    if (this.selectedDate != null) {
      this.getBooking();
    }
  }

  formatLocalISODate(param) {
    let monthString =
      param.getMonth() + 1 < 10
        ? `0${param.getMonth() + 1}`
        : `${param.getMonth() + 1}`;
    return `${param.getFullYear()}-${monthString}-${param.getDate()}`;
  }

  getBooking() {
    this._bookingService
      .getBooking(this.selectedDate, this.selectedRoom._id)
      .subscribe((res) => {
        this.bookingsData = res;
        this.bookingsData.forEach((item: any) => {
          this.slotMap[item.slot].available = false;
          this.slotMap[item.slot].default = true;
          this.slotMap[item.slot].self = item.userId === this.currentUserId;
          this.slotMap[item.slot]._id = item._id;
        });
        this.showSlotsFlag = true;
      });
  }

  sendDetails() {
    let reqBody = {
      newBookings: [],
      deletions: [],
    };
    this.newBookings.forEach((ele) => {
      reqBody.newBookings.push({
        roomId: this.selectedRoom._id,
        date: this.selectedDate,
        userId: this.currentUserId,
        slot: ele.slot,
      });
    });
    this.deletions.forEach((ele) => {
      reqBody.deletions.push({
        _id: ele._id,
        roomId: this.selectedRoom._id,
        date: this.selectedDate,
        userId: this.currentUserId,
        slot: ele.slot,
      });
    });
    this._bookingService.updateBooking(reqBody).subscribe((res) => {
      this.slotMap = JSON.parse(JSON.stringify(this.defaultSlotMap));
      this.getRoomsList();
      this.showBookingFlag = false;
      this.selectedRoom = null;
      this.getBooking();
      this.newBookings = [];
      this.deletions = [];
    });
  }

  originalOrder(a, b) {
    return a;
  }

  sendQuery() {
    this.getRoomsList();
  }

  toggleFiltersPanel() {
    this.showFiltersFlag = !this.showFiltersFlag;
  }

  resetFilters() {
    this.filtersObj.seatCount = 0;
    this.filtersObj.features = [];
    this.faclitiesArr.forEach((ele) => (ele.checked = false));
    this.getRoomsList();
  }

  applyFilters() {
    this.filtersObj.features = this.faclitiesArr
      .filter((a) => a.checked)
      .map((a) => a.id);
    this.getRoomsList();
  }

  updateUserId() {
    if (this.userIdInput.length) {
      this.currentUserId = this.userIdInput;
    }
    this.selectedRoom = null;
    this.showBookingFlag = false;
    this.getRoomsList();
  }
}
