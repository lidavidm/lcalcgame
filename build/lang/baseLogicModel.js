/**
 * 	AUTHOR's NOTE:
 * 	In developing Reduct the model was never separated from the view.
 * 	This proved efficient earlier on, but has grown to be a hassle as
 * 	more and more statements are introduced with the same semantics
 * 	but vastly different syntax; because JS has no 'interfaces',
 * 	we are forced to extend the same base class (e.g. IfStatement) whose
 * 	original visual style (e.g. a ternary) may need to be completely
 * 	overhauled (e.g. for a multi-line statement).
 *
 * 	Instead of mixing model and view, instead what we want are the
 * 	'logic' and _final_ 'syntax' of a language stored inside a 'language model,'
 * 	while the graphics (which can be completely abstract, like a treasure chest)
 * 	are left up to the stage of the game.
 *
 *	In theory this would e.g. let us swap 'Python' for 'JS' (in early levels),
 *	the crux being a core 'Statement' graphic class that expresses _any language_
 *	in its "purest" / most abstract form (just text). In other words, it takes
 *	the syntax model for a concept like 'if' in various languages:
 *
 *		|  COMMON LISP   | JAVASCRIPT  |
 *		——————————————————————————————
 *							if (<b>)
 *		(if <b> <t> <f>)        <t>
 *							else
 *								<f>
 *
 *   and then 'everything' is rendered accordingly.
 *
 * 	 Right now, swapping syntax is an incredible pain: all 'final' text classes
 * 	 have to be extended with a minor change in syntax, and these extensions
 * 	 (similar to the issue explicated above) may have to overwrite or
 * 	 duplicate large parts of code just so the Class hierarchy is
 * 	 respected.
 *
 * 	 Now, there still *can* be fancy, language-specific classes.
 * 	 But these should exist as special cases rather than the norm. And tbh,
 * 	 scrolling through lines and lines of code to decipher the semantics
 * 	 from the syntax / visuals is a paaaain. :) 
 */
"use strict";