<template>
	<div class="popup-result">
		<p class="title">5 thời gian chạy cuối cùng</p>
		<ul class="popup-result-scroll">
			<template v-if='isShow'>
				<li v-for='item in resultList' :key="item">{{item}}</li>
			</template>
			<li v-else>Tính toán kết quả...</li>
		</ul>
	</div>
</template>

<script>
export default {
	data() {
		return {
			dayRule: '',
			dayRuleSup: '',
			dateArr: [],
			resultList: [],
			isShow: false
		}
	},
	name: 'crontab-result',
	methods: {
		// Khi giá trị biểu thức thay đổi, hãy bắt đầu tính toán kết quả
		expressionChange() {

			// Tính toán kết quả ẩn
			this.isShow = false;
			// Nhận các quy tắc cho mảng [0 giây, 1 điểm, 2 giờ, 3 ngày, tháng 4, 5 tuần, 6 năm]]]
			let ruleArr = this.$options.propsData.ex.split(' ');
			// Được sử dụng để ghi lại số lần vào vòng lặp
			let nums = 0;
			// Đối với mảng cho các quy tắc thời gian ký hiệu tạm thời gửi
			let resultArr = [];
			// Nhận thời gian hiện tại chính xác đến [năm, tháng, ngày, giờ, phút, thứ hai]
			let nTime = new Date();
			let nYear = nTime.getFullYear();
			let nMonth = nTime.getMonth() + 1;
			let nDay = nTime.getDate();
			let nHour = nTime.getHours();
			let nMin = nTime.getMinutes();
			let nSecond = nTime.getSeconds();
			// Có được gần 100 năm của mảng hàng năm, mảng hàng tháng, v.v.
			this.getSecondArr(ruleArr[0]);
			this.getMinArr(ruleArr[1]);
			this.getHourArr(ruleArr[2]);
			this.getDayArr(ruleArr[3]);
			this.getMonthArr(ruleArr[4]);
			this.getWeekArr(ruleArr[5]);
			this.getYearArr(ruleArr[6], nYear);
			// Bài tập mảng sẽ được sử dụng để sử dụng
			let sDate = this.dateArr[0];
			let mDate = this.dateArr[1];
			let hDate = this.dateArr[2];
			let DDate = this.dateArr[3];
			let MDate = this.dateArr[4];
			let YDate = this.dateArr[5];
			// Nhận chỉ số thời gian hiện tại trong mảng
			let sIdx = this.getIndex(sDate, nSecond);
			let mIdx = this.getIndex(mDate, nMin);
			let hIdx = this.getIndex(hDate, nHour);
			let DIdx = this.getIndex(DDate, nDay);
			let MIdx = this.getIndex(MDate, nMonth);
			let YIdx = this.getIndex(YDate, nYear);
			// Làm mới Các chức năng của tháng ở mỗi giây (được sử dụng nhiều hơn sau)
			const resetSecond = function () {
				sIdx = 0;
				nSecond = sDate[sIdx]
			}
			const resetMin = function () {
				mIdx = 0;
				nMin = mDate[mIdx]
				resetSecond();
			}
			const resetHour = function () {
				hIdx = 0;
				nHour = hDate[hIdx]
				resetMin();
			}
			const resetDay = function () {
				DIdx = 0;
				nDay = DDate[DIdx]
				resetHour();
			}
			const resetMonth = function () {
				MIdx = 0;
				nMonth = MDate[MIdx]
				resetDay();
			}
			// Nếu năm hiện tại không phải là giá trị hiện tại trong mảng
			if (nYear !== YDate[YIdx]) {
				resetMonth();
			}
			// Nếu tháng hiện tại không phải là giá trị hiện tại trong mảng
			if (nMonth !== MDate[MIdx]) {
				resetDay();
			}
			// Nếu "ngày" hiện tại không phải là giá trị hiện tại trong mảng
			if (nDay !== DDate[DIdx]) {
				resetHour();
			}
			// Nếu "thời gian" hiện tại không phải là giá trị hiện tại trong mảng
			if (nHour !== hDate[hIdx]) {
				resetMin();
			}
			// Nếu "bộ phận" hiện tại không nằm trong giá trị hiện tại
			if (nMin !== mDate[mIdx]) {
				resetSecond();
			}

			// Mảng năm chu kỳ
			goYear: for (let Yi = YIdx; Yi < YDate.length; Yi++) {
				let YY = YDate[Yi];
				// Nếu bạn đạt được giá trị tối đa
				if (nMonth > MDate[MDate.length - 1]) {
					resetMonth();
					continue;
				}
				// Mảng tháng đạp xe
				goMonth: for (let Mi = MIdx; Mi < MDate.length; Mi++) {
					// Phân công và thuận tiện các hoạt động sau này
					let MM = MDate[Mi];
					MM = MM < 10 ? '0' + MM : MM;
					// Nếu bạn đạt được giá trị tối đa
					if (nDay > DDate[DDate.length - 1]) {
						resetDay();
						if (Mi == MDate.length - 1) {
							resetMonth();
							continue goYear;
						}
						continue;
					}
					// Mảng ngày chu kỳ
					goDay: for (let Di = DIdx; Di < DDate.length; Di++) {
						// Phân công và thuận tiện các hoạt động sau này
						let DD = DDate[Di];
						let thisDD = DD < 10 ? '0' + DD : DD;

						// Nếu bạn đạt được giá trị tối đa
						if (nHour > hDate[hDate.length - 1]) {
							resetHour();
							if (Di == DDate.length - 1) {
								resetDay();
								if (Mi == MDate.length - 1) {
									resetMonth();
									continue goYear;
								}
								continue goMonth;
							}
							continue;
						}

						// Đánh giá tính hợp pháp của ngày, nếu bất hợp pháp, nó cũng sẽ nhảy ra khỏi chu kỳ hiện tại
						if (this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true && this.dayRule !== 'workDay' && this.dayRule !== 'lastWeek' && this.dayRule !== 'lastDay') {
							resetDay();
							continue goMonth;
						}
						// Nếu có giá trị trong các quy tắc ngày
						if (this.dayRule == 'lastDay') {
							// Nếu đó không phải là ngày hợp pháp, ngày trước ngày hợp pháp sẽ được điều chỉnh vào ngày cuối cùng vào cuối tháng.

							if (this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
								while (DD > 0 && this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
									DD--;

									thisDD = DD < 10 ? '0' + DD : DD;
								}
							}
						} else if (this.dayRule == 'workDay') {
							// Việc xác minh và điều chỉnh nên được điều chỉnh vào cuối tháng bình thường khi ngày này được thông qua vào ngày 30 tháng 2
							if (this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
								while (DD > 0 && this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
									DD--;
									thisDD = DD < 10 ? '0' + DD : DD;
								}
							}
							// Ngày để có được điều kiện là tuần x
							let thisWeek = this.formatDate(new Date(YY + '-' + MM + '-' + thisDD + ' 00:00:00'), 'week');
							// Chủ nhật
							if (thisWeek == 1) {
								// Tìm ngày hôm sau và xác định xem đó có phải là cuối tháng
								DD++;
								thisDD = DD < 10 ? '0' + DD : DD;
								// Xác định không còn là ngày hợp pháp cho ngày hôm sau
								if (this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
									DD -= 3;
								}
							} else if (thisWeek == 7) {
								// Chỉ cần đánh giá rằng nó không phải là 1 trong tuần, nó có thể được vận hành.
								if (this.dayRuleSup !== 1) {
									DD--;
								} else {
									DD += 2;
								}
							}
						} else if (this.dayRule == 'weekDay') {
							// Nếu bạn được chỉ định, tuần là gì
							// Ngày hiện tại là tuần trong tuần
							let thisWeek = this.formatDate(new Date(YY + '-' + MM + '-' + DD + ' 00:00:00'), 'week');
							// Kiểm tra xem tuần hiện tại có trên bể bơi hàng tuần không (dayRuleSup）tên đệm
							if (this.dayRuleSup.indexOf(thisWeek) < 0) {
								// Nếu bạn đạt được giá trị tối đa
								if (Di == DDate.length - 1) {
									resetDay();
									if (Mi == MDate.length - 1) {
										resetMonth();
										continue goYear;
									}
									continue goMonth;
								}
								continue;
							}
						} else if (this.dayRule == 'assWeek') {
							// Nếu bạn được chỉ định, vài tuần trong tuần
							// Có được thứ 1 hàng tháng là tuần trong tuần
							let thisWeek = this.formatDate(new Date(YY + '-' + MM + '-' + DD + ' 00:00:00'), 'week');
							if (this.dayRuleSup[1] >= thisWeek) {
								DD = (this.dayRuleSup[0] - 1) * 7 + this.dayRuleSup[1] - thisWeek + 1;
							} else {
								DD = this.dayRuleSup[0] * 7 + this.dayRuleSup[1] - thisWeek + 1;
							}
						} else if (this.dayRule == 'lastWeek') {
							// Nếu tuần cuối cùng của mỗi tháng được chỉ định
							// Việc xác minh và điều chỉnh nên được điều chỉnh vào cuối tháng bình thường khi ngày này được thông qua vào ngày 30 tháng 2
							if (this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
								while (DD > 0 && this.checkDate(YY + '-' + MM + '-' + thisDD + ' 00:00:00') !== true) {
									DD--;
									thisDD = DD < 10 ? '0' + DD : DD;
								}
							}
							// Ngày cuối cùng của việc mua lại là tuần trong ngày
							let thisWeek = this.formatDate(new Date(YY + '-' + MM + '-' + thisDD + ' 00:00:00'), 'week');
							// Tìm tuần gần đây nhất trong yêu cầu
							if (this.dayRuleSup < thisWeek) {
								DD -= thisWeek - this.dayRuleSup;
							} else if (this.dayRuleSup > thisWeek) {
								DD -= 7 - (this.dayRuleSup - thisWeek)
							}
						}
						// Xác định xem giá trị thời gian nhỏ hơn 10 và thay thế định dạng "05"
						DD = DD < 10 ? '0' + DD : DD;

						// Mảng "Thời gian" chu kỳ
						goHour: for (let hi = hIdx; hi < hDate.length; hi++) {
							let hh = hDate[hi] < 10 ? '0' + hDate[hi] : hDate[hi]

							// Nếu bạn đạt được giá trị tối đa
							if (nMin > mDate[mDate.length - 1]) {
								resetMin();
								if (hi == hDate.length - 1) {
									resetHour();
									if (Di == DDate.length - 1) {
										resetDay();
										if (Mi == MDate.length - 1) {
											resetMonth();
											continue goYear;
										}
										continue goMonth;
									}
									continue goDay;
								}
								continue;
							}
							// Mảng "phân chia" chu kỳ
							goMin: for (let mi = mIdx; mi < mDate.length; mi++) {
								let mm = mDate[mi] < 10 ? '0' + mDate[mi] : mDate[mi];

								// Nếu bạn đạt được giá trị tối đa
								if (nSecond > sDate[sDate.length - 1]) {
									resetSecond();
									if (mi == mDate.length - 1) {
										resetMin();
										if (hi == hDate.length - 1) {
											resetHour();
											if (Di == DDate.length - 1) {
												resetDay();
												if (Mi == MDate.length - 1) {
													resetMonth();
													continue goYear;
												}
												continue goMonth;
											}
											continue goDay;
										}
										continue goHour;
									}
									continue;
								}
								// Chu kỳ "thứ hai" mảng
								goSecond: for (let si = sIdx; si <= sDate.length - 1; si++) {
									let ss = sDate[si] < 10 ? '0' + sDate[si] : sDate[si];
									// Thêm thời gian hiện tại (tính hợp pháp đã được đánh giá vào chu kỳ ngày)
									if (MM !== '00' && DD !== '00') {
										resultArr.push(YY + '-' + MM + '-' + DD + ' ' + hh + ':' + mm + ':' + ss)
										nums++;
									}
									// Nếu dải đầy, vòng lặp được thoát
									if (nums == 5) break goYear;
									// Nếu bạn đạt được giá trị tối đa
									if (si == sDate.length - 1) {
										resetSecond();
										if (mi == mDate.length - 1) {
											resetMin();
											if (hi == hDate.length - 1) {
												resetHour();
												if (Di == DDate.length - 1) {
													resetDay();
													if (Mi == MDate.length - 1) {
														resetMonth();
														continue goYear;
													}
													continue goMonth;
												}
												continue goDay;
											}
											continue goHour;
										}
										continue goMin;
									}
								} //goSecond
							} //goMin
						}//goHour
					}//goDay
				}//goMonth
			}
			// Xác định số lượng kết quả trong vòng 100 năm
			if (resultArr.length == 0) {
				this.resultList = ['Không có kết quả của điều kiện!'];
			} else {
				this.resultList = resultArr;
				if (resultArr.length !== 5) {
					this.resultList.push('Chỉ ở trên trong 100 năm qua' + resultArr.length + 'Kết quả là!')
				}
			}
			// Tính toán kết quả phát hiện
			this.isShow = true;


		},
		// Được sử dụng để tính toán chỉ số của một kỹ thuật số trong mảng
		getIndex(arr, value) {
			if (value <= arr[0] || value > arr[arr.length - 1]) {
				return 0;
			} else {
				for (let i = 0; i < arr.length - 1; i++) {
					if (value > arr[i] && value <= arr[i + 1]) {
						return i + 1;
					}
				}
			}
		},
		// Nhận mảng "năm"
		getYearArr(rule, year) {
			this.dateArr[5] = this.getOrderArr(year, year + 100);
			if (rule !== undefined) {
				if (rule.indexOf('-') >= 0) {
					this.dateArr[5] = this.getCycleArr(rule, year + 100, false)
				} else if (rule.indexOf('/') >= 0) {
					this.dateArr[5] = this.getAverageArr(rule, year + 100)
				} else if (rule !== '*') {
					this.dateArr[5] = this.getAssignArr(rule)
				}
			}
		},
		// Nhận mảng "Mặt trăng"
		getMonthArr(rule) {
			this.dateArr[4] = this.getOrderArr(1, 12);
			if (rule.indexOf('-') >= 0) {
				this.dateArr[4] = this.getCycleArr(rule, 12, false)
			} else if (rule.indexOf('/') >= 0) {
				this.dateArr[4] = this.getAverageArr(rule, 12)
			} else if (rule !== '*') {
				this.dateArr[4] = this.getAssignArr(rule)
			}
		},
		// Nhận mảng "hàng ngày" chính cho các quy tắc ngày
		getWeekArr(rule) {
			// Chỉ có hai giá trị của ngày của ngày là "".
			if (this.dayRule == '' && this.dayRuleSup == '') {
				if (rule.indexOf('-') >= 0) {
					this.dayRule = 'weekDay';
					this.dayRuleSup = this.getCycleArr(rule, 7, false)
				} else if (rule.indexOf('#') >= 0) {
					this.dayRule = 'assWeek';
					let matchRule = rule.match(/[0-9]{1}/g);
					this.dayRuleSup = [Number(matchRule[1]), Number(matchRule[0])];
					this.dateArr[3] = [1];
					if (this.dayRuleSup[1] == 7) {
						this.dayRuleSup[1] = 0;
					}
				} else if (rule.indexOf('L') >= 0) {
					this.dayRule = 'lastWeek';
					this.dayRuleSup = Number(rule.match(/[0-9]{1,2}/g)[0]);
					this.dateArr[3] = [31];
					if (this.dayRuleSup == 7) {
						this.dayRuleSup = 0;
					}
				} else if (rule !== '*' && rule !== '?') {
					this.dayRule = 'weekDay';
					this.dayRuleSup = this.getAssignArr(rule)
				}
			}
		},
		// Nhận mảng "hàng ngày"-một số lượng nhỏ là quy tắc ngày
		getDayArr(rule) {
			this.dateArr[3] = this.getOrderArr(1, 31);
			this.dayRule = '';
			this.dayRuleSup = '';
			if (rule.indexOf('-') >= 0) {
				this.dateArr[3] = this.getCycleArr(rule, 31, false)
				this.dayRuleSup = 'null';
			} else if (rule.indexOf('/') >= 0) {
				this.dateArr[3] = this.getAverageArr(rule, 31)
				this.dayRuleSup = 'null';
			} else if (rule.indexOf('W') >= 0) {
				this.dayRule = 'workDay';
				this.dayRuleSup = Number(rule.match(/[0-9]{1,2}/g)[0]);
				this.dateArr[3] = [this.dayRuleSup];
			} else if (rule.indexOf('L') >= 0) {
				this.dayRule = 'lastDay';
				this.dayRuleSup = 'null';
				this.dateArr[3] = [31];
			} else if (rule !== '*' && rule !== '?') {
				this.dateArr[3] = this.getAssignArr(rule)
				this.dayRuleSup = 'null';
			} else if (rule == '*') {
				this.dayRuleSup = 'null';
			}
		},
		// Nhận mảng "Thời gian"
		getHourArr(rule) {
			this.dateArr[2] = this.getOrderArr(0, 23);
			if (rule.indexOf('-') >= 0) {
				this.dateArr[2] = this.getCycleArr(rule, 24, true)
			} else if (rule.indexOf('/') >= 0) {
				this.dateArr[2] = this.getAverageArr(rule, 23)
			} else if (rule !== '*') {
				this.dateArr[2] = this.getAssignArr(rule)
			}
		},
		// Nhận mảng "chia"
		getMinArr(rule) {
			this.dateArr[1] = this.getOrderArr(0, 59);
			if (rule.indexOf('-') >= 0) {
				this.dateArr[1] = this.getCycleArr(rule, 60, true)
			} else if (rule.indexOf('/') >= 0) {
				this.dateArr[1] = this.getAverageArr(rule, 59)
			} else if (rule !== '*') {
				this.dateArr[1] = this.getAssignArr(rule)
			}
		},
		// Nhận mảng "thứ hai"
		getSecondArr(rule) {
			this.dateArr[0] = this.getOrderArr(0, 59);
			if (rule.indexOf('-') >= 0) {
				this.dateArr[0] = this.getCycleArr(rule, 60, true)
			} else if (rule.indexOf('/') >= 0) {
				this.dateArr[0] = this.getAverageArr(rule, 59)
			} else if (rule !== '*') {
				this.dateArr[0] = this.getAssignArr(rule)
			}
		},
		// Tùy thuộc vào Min-Max được truyền vào, một thứ tự mảng trả về một chuỗi
		getOrderArr(min, max) {
			let arr = [];
			for (let i = min; i <= max; i++) {
				arr.push(i);
			}
			return arr;
		},
		// Trở lại một mảng theo giá trị phân tán được chỉ định trong các quy tắc
		getAssignArr(rule) {
			let arr = [];
			let assiginArr = rule.split(',');
			for (let i = 0; i < assiginArr.length; i++) {
				arr[i] = Number(assiginArr[i])
			}
			arr.sort(this.compare)
			return arr;
		},
		//Tính toán một mảng dựa trên một quy tắc số học nhất định
		getAverageArr(rule, limit) {
			let arr = [];
			let agArr = rule.split('/');
			let min = Number(agArr[0]);
			let step = Number(agArr[1]);
			while (min <= limit) {
				arr.push(min);
				min += step;
			}
			return arr;
		},
		// Trả về một mảng định kỳ theo các quy tắc
		getCycleArr(rule, limit, status) {
			// status-- Nó có nghĩa là liệu nó có bắt đầu từ 0 (sau đó bắt đầu từ 1)
			let arr = [];
			let cycleArr = rule.split('-');
			let min = Number(cycleArr[0]);
			let max = Number(cycleArr[1]);
			if (min > max) {
				max += limit;
			}
			for (let i = min; i <= max; i++) {
				let add = 0;
				if (status == false && i % limit == 0) {
					add = limit;
				}
				arr.push(Math.round(i % limit + add))
			}
			arr.sort(this.compare)
			return arr;
		},
		// So sánh số (được sử dụng cho Array.sort）
		compare(value1, value2) {
			if (value2 - value1 > 0) {
				return -1;
			} else {
				return 1;
			}
		},
		// hĐịnh dạng địn dạng ngày như: 2017-9-19 18:04:33
		formatDate(value, type) {
			// Tính toán giá trị tương quan ngày
			let time = typeof value == 'number' ? new Date(value) : value;
			let Y = time.getFullYear();
			let M = time.getMonth() + 1;
			let D = time.getDate();
			let h = time.getHours();
			let m = time.getMinutes();
			let s = time.getSeconds();
			let week = time.getDay();
			// Nếu nó được thông qua type nếu
			if (type == undefined) {
				return Y + '-' + (M < 10 ? '0' + M : M) + '-' + (D < 10 ? '0' + D : D) + ' ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
			} else if (type == 'week') {
				// hiện hữu quartz tên đệm 1 Chủ nhật
				return week + 1;
			}
		},
		// Kiểm tra xem ngày có tồn tại không
		checkDate(value) {
			let time = new Date(value);
			let format = this.formatDate(time)
			return value === format;
		}
	},
	watch: {
		'ex': 'expressionChange'
	},
	props: ['ex'],
	mounted: function () {
		// Khởi tạo kết quả của một kết quả
		this.expressionChange();
	}
}

</script>
