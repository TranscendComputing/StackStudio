(function ( $ ) {

	$.widget("msi.instructor", {
		
		options : {
			steps : [],
			nextTipOnClick : false,
			onClose: null,
			onProgressChange: null,
			afterRender: null,
			afterTipRender: null,
			fromExisting: null
		},

		_create : function () {
			var self = this;

			if(this.options.afterRender) {
				this.afterRender = this.options.afterRender;
			}
			if(this.options.afterTipRender) {
				this.afterTipRender = this.options.afterTipRender;
			}

			this.steps = this.options.steps;
			this.previousTips = [];

			var firstStep = this.steps[0];
			this._initIndexes();

			if(this.options.fromExisting) {
				$.each(this.options.fromExisting.progress, function ( index, step ) {
					var thisStep = self.options.steps[step.stepIndex];
					thisStep.lastTip = thisStep.tips[step.lastTipIndex];
					thisStep.started = (step.started === "true" || step.completed === true);
					thisStep.completed = (step.completed === "true" || step.completed === true);
				});

				this.completed = this.options.fromExisting.completed;
				var currentStep = _.first(_.where(this.options.steps, { started: true, completed: false }));
			}

			this._initTutorialView();

			if(this.options.fromExisting) {
				this.goToStep(currentStep.title, true);
			} else {
				this.goToStep(firstStep.title, true);
			}

			this.onClose = this.options.onClose;
			this.onProgressChange = this.options.onProgressChange;
			this.started = true;
		},

		_initIndexes : function () {
			var stepIndex = 0
				, tipIndex = 0;
			$.each(this.steps, function ( index, step ) {
				step.num = stepIndex;
				tipIndex = 0;
				$.each(step.tips, function ( idx, tip ){
					tip.num = tipIndex;
					tipIndex++;
				});
				stepIndex++;
			});
		},

		_initTutorialView : function () {
			var self = this
				, tutView = this._getByAttr('data-instructor-view-for', this.element.attr('id'))
				, numSteps = self.steps.length
				, $stepLabel;

			this.view = tutView;

			if(!tutView.length) return;

			$.each(this.steps, function ( index, step ) {
			  $stepLabel = $('<div data-instructor-step="' + step.title + '" class="instructor-step-label"><a href="#">' + step.title + '</a><span class="completed-icon">&#x2713</span></div>');
			  if(step.completed) {
			  	$stepLabel.addClass('completed');
			  }
			  $stepLabel.click(function ( e ) {
			  	e.preventDefault();
			  	self.goToStep(step.title, true);
			  });

			  // var widthPercentage = parseFloat(100) / numSteps; 
			  // $stepLabel.css('width', widthPercentage + '%');
				tutView.find('.tutorial-steps').append($stepLabel);
			});

			tutView.find('.tutorial-steps').append('<br class="instructor-clearfix" />');
			this.element.find('.close-tutorial').click(function () {
				self.close();
			});

			if(this.afterRender) {
				this.afterRender(this);
			}
		},

		_getProgress : function () {

			var completed = true;
			var self = this;

			$.each(this.steps, function ( index, step ) {
				if(!step.completed) {
					completed = false;
				}
			});
			return {
				started: this.started,
				progress: this.steps.map(function ( step ) {
					return {
						stepIndex : step.num,
						started : !!step.started,
						completed : !!step.completed,
						lastTipIndex : step.lastTip ? step.lastTip.num : 0
					};
				}),
				completed: completed
			};
		},

		_getById : function ( id ) {
			var $el = $('#' + id);
			if($el.length) {
				return $el;
			} else {
				console.error('No element found with id "' + id + '"');
			}
		},

		_getByAttr : function ( attrName, attrVal ) {
			if(!attrVal) {
				return $('[' + attrName + ']'); 
			}
			return $('[' + attrName + '="' + attrVal + '"]');
		},

		_getStepByName : function ( name ) {
			var step;
			$.each(this.steps, function ( index, item ) {
				if(item.title == name) {
					step = item;
				}
			});

			if (!step) {
				throw new Error('Step "' + name + '" was not found');
			}

			return step;
		},

		_getUpdated : function ( $el ) {
			return $($el.selector);
		},

		_attachClickEvent : function ( tip ) {
			//set up click event for new tip
			var $el = $(tip.element.selector);
			var clickHandler = tip.onClicked;
			if(clickHandler) {
				if(clickHandler === 'nextTip') {
					$($el.selector).unbind('click', this.nextTip);
					$(document).one('click', $el.selector, this.nextTip.bind(this));	
				} else {
					$($el.selector).unbind('click', clickHandler);
					$(document).one('click', $el.selector, clickHandler);
				}
			}
		},

		_stepCompleted : function ( step ) {
			$('[data-instructor-step="' + step.title + '"]').addClass('completed');
			step.completed = true;
		},

		_findTip : function ( id ) {
			var self = this;
			$.each(this.steps, function ( index, step ) {
				$.each(step.tips, function ( idx, tip ) {
					if(tip.id && tip.id === id) {
						return {
							step : step,
							tip : tip
						};
					}
				});
			});
		},

		tooltip : function ( $el , message, title ) {
			var options = {
				target: true,
				tipJoint:"left",
				targetJoint: "right",
				showOn: "creation",
				hideTrigger: 'closeButton',
				hideOn: []
			};
			return new Opentip($el, message, title, options);
		},

		hideTips : function () {
			$.each(this.previousTips, function ( index, tip ) {
				tip.openTip.hide();
			});
		},

		goToStep : function ( title, callChangeEvt, skipUpdates ) {
			var $stepLabel = this._getByAttr('data-instructor-step', title)
				, step = this._getStepByName(title);

			step.started = true;

			this.hideOldTips();
			$('.current-step').removeClass('current-step');
			this._getUpdated($stepLabel).addClass('current-step');

			this.currentStep = step;
			this.currentTip = step.tips[0];

			if(step.messageElement && step.message) {
				this._getUpdated(step.messageElement).html(step.message);
			}

			this._attachClickEvent(this.currentTip);
			if(step.onStart) {
				step.onStart.call(step);
			}

			if(this.options.onStepSelect && callChangeEvt === true) {
				this.options.onStepSelect(step);
			}

			if(this.options.onProgressChange && !skipUpdates) {
				this.options.onProgressChange(this._getProgress());
			}
		},

		nextStep : function () {
			var currentStepIndex = this.currentStep.num
				, nextStep = this.steps[currentStepIndex + 1] || {}
				, nextStepIndex = nextStep.num;

			this._stepCompleted(this.currentStep);
			if(nextStepIndex > -1) {
				this.goToStep(nextStep.title, false);
				return true;
			} else {
				console.log('No more steps in tutorial');
				this.hideOldTips();
				return false;
			}
		},

		nextTip : function ( show, skipUpdates ) {
			var self = this;
			var currentTipIndex = this.currentTip.num
				, nextTip = this.currentStep.tips[currentTipIndex + 1] || {}
				, nextTipIndex = nextTip.num;
			//if there is another tip in this step, that's our tip
			if(this.currentStep.tips.length > nextTipIndex) {
				this.currentTip =  nextTip;

				if(this.onProgressChange && !skipUpdates) {
					this.onProgressChange(this._getProgress());
				}
			} else { //otherwise, go to next step
				this.nextStep();
			}

			this._attachClickEvent(this.currentTip);
			this.hideOldTips();

			if(show === true) {
				this.showTip();
			} 
		},

		goToTip : function ( id, show ) {
			var tip = this._findTip(id);
			if(tip) {
				this.goToStep(tip.step.title, false, false);
				this.currentTip = tip.tip;
				if(this.onProgressChange) {
					this.onProgressChange(this._getProgress());
				}
				if(show) {
					this.showTip();
				}
			}
		},

		showTip : function ( ) {
			this.hideOldTips();
			this.currentTip.openTip = this.tooltip(this._getUpdated(this.currentTip.element), this.currentTip.message, this.currentTip.title);
			this.currentStep.lastTip = this.currentTip;
			this.previousTips.push(this.currentTip);
			if(this.afterTipRender) {
				this.afterTipRender(this.currentTip.openTip);
			}
		},

		hideOldTips : function () {
			if(this.previousTips && this.previousTips.length > 0) {
				$.each(this.previousTips, function ( index, tip ) {
					tip.openTip.hide();
				});
			}
		},

		close : function () {
			this.hideOldTips();
			this.steps = [];
			this.view.hide();

			if(this.onClose) {
				this.onClose(this);
			}
		} 
	});
})(jQuery);