const database = {
	0: {
		8: {
			class: 'CT',
			hour: 8,
			span: 1,
		},
		9: {
			class: 'CSE103',
			hour: 9,
			span: 1,
		},
		10: {
			class: 'MATH141',
			hour: 10,
			span: 1,
		},
		11: {
			class: 'EEE163',
			hour: 11,
			span: 1,
		},
	},
	1: {
		9: {
			class: 'EEE163',
			hour: 9,
			span: 1,
		},
		10: {
			class: 'CSE101',
			hour: 10,
			span: 1,
		},
		11: {
			class: 'CSE102',
			hour: 11,
			span: 3,
		},
		14: {
			class: 'PHY114',
			hour: 2,
			span: 3,
		},
	},
	2: {
		8: {
			class: 'CT',
			hour: 8,
			span: 1,
		},
		9: {
			class: 'CSE103',
			hour: 9,
			span: 1,
		},
		10: {
			class: 'CSE101',
			hour: 10,
			span: 1,
		},
		11: {
			class: 'MATH141',
			hour: 11,
			span: 1,
		},
		12: {
			class: 'PHY129',
			hour: 12,
			span: 1,
		},
	},
	3: {
		9: {
			class: 'CSE101',
			hour: 9,
			span: 1,
		},
		10: {
			class: 'CSE103',
			hour: 10,
			span: 1,
		},
		11: {
			class: 'PHY129',
			hour: 11,
			span: 1,
		},
		12: {
			class: 'MATH141',
			hour: 12,
			span: 1,
		},
		14: {
			class: 'EEE164',
			hour: 2,
			span: 3,
		},
	},
	4: {
		8: {
			class: 'CT',
			hour: 8,
			span: 1,
		},
		9: {
			class: 'EEE163',
			hour: 9,
			span: 1,
		},
		10: {
			class: 'PHY129',
			hour: 10,
			span: 1,
		},
		11: {
			class: 'CSE102',
			hour: 11,
			span: 3,
		},
	},
};

const container = document.querySelector('.container');
const routineTable = document.querySelector('.routine-table');
const routineTableClass = document.createElement('DIV');
routineTableClass.classList.add('routine-table-class');

{
	const block = document.createElement('DIV');
	block.classList.add('block');
	block.classList.add('block--hours');
	block.innerHTML = `Day`;
	routineTable.appendChild(block);
}

const weekdays = [`SAT`, `SUN`, `MON`, `TUE`, `WED`];

{
	for (let hour = 8; hour <= 16; hour++) {
		const block = document.createElement('DIV');
		block.classList.add('block');
		block.classList.add('block--hours');
		block.innerText = `${((hour - 1) % 12) + 1}`;
		routineTable.appendChild(block);
	}
}

routineTable.appendChild(routineTableClass);

const addClass = (row, hour, courseData) => {
	const block = document.createElement('DIV');
	block.classList.add('block');
	block.classList.add('block--class');
	block.id = `block--${row}-${hour}`;

	block.dataset.span = 1;

	block.style.gridRow = `${row}`;
	block.style.gridColumn = `${hour - 7}`;

	if (courseData) {
		block.innerText = courseData.class;
		block.dataset.span = courseData.span;
		block.style.gridColumn = `${hour - 7} / span ${courseData.span}`;
	}
	routineTableClass.appendChild(block);

	return (courseData ? courseData.span : 1) - 1;
};

for (let row = 1; row <= 5; row++) {
	const blockWeekday = document.createElement('DIV');
	blockWeekday.classList.add('block');
	blockWeekday.classList.add('block--weekdays');
	blockWeekday.innerHTML = weekdays[row - 1];
	routineTable.appendChild(blockWeekday);

	for (let hour = 8; hour <= 16; hour++) {
		hour += addClass(row, hour, database[row - 1][hour]);
	}
}

const tempBlock = document.createElement('DIV');
tempBlock.classList.add('block');
tempBlock.classList.add('block--temp');
tempBlock.style.opacity = 0;
document.body.appendChild(tempBlock);

let tempBlockInserted = false;

const trackMouse = (event) => {
	tempBlock.style.opacity = 1;
	tempBlock.style.top = `${event.pageY}px`;
	tempBlock.style.left = `${event.pageX}px`;
};

container.addEventListener('mousedown', (event) => {
	let elem = event.target;
	if (!elem.classList.contains('block--class')) {
		return;
	}
	if (event.altKey) {
		return;
	}

	pauseEvent(event);

	tempBlock.innerHTML = elem.innerHTML;
	tempBlock.dataset.srcBlockId = elem.id;
	const elemWidth = elem.clientWidth;
	const elemHeight = elem.clientHeight;
	tempBlock.style.width = `${elemWidth}px`;
	tempBlock.style.height = `${elemHeight}px`;

	tempBlockInserted = true;

	window.addEventListener('mousemove', trackMouse);
});

container.addEventListener('mouseup', (event) => {
	pauseEvent(event);

	if (tempBlockInserted && event.target.classList.contains('block--class')) {
		exchangeBlocks(document.getElementById(tempBlock.dataset.srcBlockId), event.target);
	}

	tempBlock.style.opacity = 0;
	tempBlockInserted = false;

	window.removeEventListener('mousemove', trackMouse);
});

const pauseEvent = (e) => {
	if (e.stopPropagation) e.stopPropagation();
	if (e.preventDefault) e.preventDefault();
	e.cancelBubble = true;
	e.returnValue = false;
	return false;
};

const parseRowColFromID = (id) => {
	let rc = id
		.substr(7)
		.trim()
		.split('-')
		.map((e) => {
			return parseInt(e);
		});
	return { row: rc[0], col: rc[1] - 7 };
};

const exchangeBlocks = (initial, final) => {
	const initialCell = parseRowColFromID(initial.id);
	const finalCell = parseRowColFromID(final.id);

	if (finalCell.col + parseInt(initial.dataset.span) > 10) {
		return;
	}
	if (initialCell.col + parseInt(final.dataset.span) > 10) {
		return;
	}

	let maxSize = Math.max(parseInt(initial.dataset.span), parseInt(final.dataset.span));

	let netSize = 0;
	for (let i = 0; i < maxSize; i++) {
		const classBlockI = document.getElementById(`block--${initialCell.row}-${initialCell.col + 7 + i}`);
		const classBlockF = document.getElementById(`block--${finalCell.row}-${finalCell.col + 7 + i}`);

		if (classBlockI) {
			if (classBlockI != final) {
				netSize += parseInt(classBlockI.dataset.span);
			} else {
				netSize += Math.min(parseInt(final.dataset.span), maxSize - i);
			}
		}
		if (classBlockF) {
			if (classBlockF != initial) {
				netSize -= parseInt(classBlockF.dataset.span);
			} else {
				netSize -= Math.min(parseInt(initial.dataset.span), maxSize - i);
			}
		}
		console.log(classBlockI, classBlockF, netSize);
	}
	if (netSize != 0) {
		return;
	}

	for (let i = 0; i < maxSize; i++) {
		const classBlockI = document.getElementById(`block--${initialCell.row}-${initialCell.col + 7 + i}`);
		const classBlockF = document.getElementById(`block--${finalCell.row}-${finalCell.col + 7 + i}`);

		if (classBlockI) {
			classBlockI.style.gridRow = `${finalCell.row}`;
			classBlockI.style.gridColumn = `${finalCell.col + i} / span ${classBlockI.dataset.span}`;
			classBlockI.id = `block--${finalCell.row}-${finalCell.col + 7 + i}`;
		}
		if (classBlockF) {
			classBlockF.style.gridRow = `${initialCell.row}`;
			classBlockF.style.gridColumn = `${initialCell.col + i} / span ${classBlockF.dataset.span}`;
			classBlockF.id = `block--${initialCell.row}-${initialCell.col + 7 + i}`;
		}
	}
};
