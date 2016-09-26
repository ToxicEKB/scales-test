'use strict';

var panWrapperCommonClass = 'pan-wrapper';
var indicatorCommonClass = 'indicator';

// Создает новый HTML-элемент. нужно для рисования UI
function createElement(name, text, opts) {
	var e = document.createElement(name);

	if (text !== null && text !== undefined) {
		var t = document.createTextNode(text);
		e.appendChild(t);
	}

	for (var an in opts) {
		e.setAttribute(an, opts[an]);
	}

	return e;
}

function createRecalcScalesHandler(appw) {
	return function() {
		var weightLeft = 0;
		var weightRight = 0;

		for (var c of appw.ui.left.children) {
			weightLeft += Number(c.weight);
		}
		for (var c of appw.ui.right.children) {
			weightRight += Number(c.weight);
		}

		appw.ui.left.weight = weightLeft;
		appw.ui.right.weight = weightRight;

		// Мы перевзвесили чаши, теперь применим классы к чашам и индикатору,
		// чтобы отобразить изменения на экране

		if (weightRight == weightLeft) {
			appw.ui.leftWrapper.className = panWrapperCommonClass;
			appw.ui.rightWrapper.className = panWrapperCommonClass;
			appw.ui.indicator.className = indicatorCommonClass;

		} else if (weightLeft < weightRight) {
			appw.ui.leftWrapper.className = panWrapperCommonClass + ' less';
			appw.ui.rightWrapper.className = panWrapperCommonClass + ' more';
			appw.ui.indicator.className = indicatorCommonClass + ' right';
		} else {
			appw.ui.leftWrapper.className = panWrapperCommonClass + ' more';
			appw.ui.rightWrapper.className = panWrapperCommonClass + ' less';
			appw.ui.indicator.className = indicatorCommonClass + ' left';
		}

		console.log('left:', weightLeft, 'right', weightRight);
	}
}

// создание пустых элементов-контейнеров
// здесь создается весь интерфейс (все DIV элементы)
// с нужной вложенностью
function initUI(appw) {

	appw.ui = {};

	// обертка для чаш. Нужна только для того,
	// чтобы легко прикручивать CSS
	var scalesWrapper = createElement('div', null, {
		'class': 'scales-wrapper'
	});
	appw.appendChild(scalesWrapper);

	// Вложенные обертки
	// обертка для левой чаши
	var lwrapper = createElement('div', null, {
		'class': panWrapperCommonClass
	});
	appw.ui.leftWrapper = lwrapper;
	scalesWrapper.appendChild(lwrapper);

	// обертка для индикатора
	var indicator = createElement('div', null, {
		'class': indicatorCommonClass
	});
	scalesWrapper.appendChild(indicator);
	appw.ui.indicator = indicator;

	// обертка для правой чаши
	var rwrapper = createElement('div', null, {
		'class': panWrapperCommonClass
	});
	appw.ui.rightWrapper = rwrapper;
	scalesWrapper.appendChild(rwrapper);

	// Вложенные элементы интефейса
	// Сначала чаши
	// левая чаша
	var l = createElement('div', null, {
		'class': 'scalepan left droppable'
	});
	appw.ui.left = l;
	appw.ui.left.weight = 0;
	lwrapper.appendChild(l);

	var r = createElement('div', null, {
		'class': 'scalepan right droppable'
	});
	appw.ui.right = r;
	appw.ui.right.weight = 0;
	rwrapper.appendChild(r);

	var lg = createElement('div', null, {
		'class': 'luggage droppable'
	});
	appw.ui.luggage = lg;
	appw.appendChild(lg);

	// создаем все чемоданы
	appw.ui.suitcases = [];
	var i = 0;
	for (var w of SUITCASE_WEIGHTS) {
		var sc = createElement('div', i+1 , {
			'class': 'suitcase s' + i + ' draggable',
			//'data-weight': w,
		});
		sc.weight = w;

		appw.ui.luggage.appendChild(sc);
		appw.ui.suitcases.push(sc);

		i++;
	}

	// обработчик "чемодан бросили"
	var hndl = createRecalcScalesHandler(appw);
	appw.ui.left.onDrop = hndl;
	appw.ui.right.onDrop = hndl;
	appw.ui.luggage.onDrop = hndl;
}

DragManager.onDragEnd = function(suitcaseObject, zone) {

	// скрыть/удалить переносимый объект
	suitcaseObject.elem.style.position = '';
	suitcaseObject.elem.style.top = null;
	suitcaseObject.elem.style.left = null;
	suitcaseObject.elem.style.right = null;
	suitcaseObject.elem.style.bottom = null;
    //suitcaseObject.elem.zIndex = 9999;

	zone.appendChild(suitcaseObject.elem);

	if (zone.onDrop) {
		zone.onDrop();
	}

	// успешный перенос, показать улыбку классом computer-smile
	//zone.className = 'computer computer-smile';
};

DragManager.onDragCancel = function(suitcaseObject) {
	// откат переноса
	suitcaseObject.avatar.rollback();
};


var SUITCASE_WEIGHTS = [1, 2, 12, 4, 7, 10, 100, 12, 4, 111, 222, 0];

var appw = document.getElementById('scales');

initUI(appw);
