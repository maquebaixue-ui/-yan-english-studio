// Original, answer-checked learning examples. Not official IELTS questions.
export const TRANSFORMS=[
 ['t01','否定句','She studies English every day.','改成否定句','She does not study English every day.',["She doesn't study English every day."],'does not / doesn’t 后用动词原形 study。'],
 ['t02','过去时','I study English every day.','把 every day 换成 yesterday，改成过去时','I studied English yesterday.',[],'昨天已经发生，study 的过去式是 studied。'],
 ['t03','过去否定','She went to school yesterday.','改成否定句','She did not go to school yesterday.',["She didn't go to school yesterday."],'did not / didn’t 已经表示过去，后面用 go，不能再用 went。'],
 ['t04','一般疑问句','You like reading.','改成一般疑问句','Do you like reading?',[],'主语 you，借助 Do 提问，like 用原形。'],
 ['t05','否定句','He works on Sundays.','改成否定句','He does not work on Sundays.',["He doesn't work on Sundays."],'主语 he，使用 doesn’t；work 去掉 -s。'],
 ['t06','过去时','We visit the library every week.','把 every week 换成 last week，改成过去时','We visited the library last week.',[],'规则动词 visit 加 -ed；时间改为 last week。'],
 ['t07','过去否定','They bought a new book yesterday.','改成否定句','They did not buy a new book yesterday.',["They didn't buy a new book yesterday."],'didn’t 后，bought 还原为 buy。'],
 ['t08','一般疑问句','She needs more time.','改成一般疑问句','Does she need more time?',[],'Does 放在主语前，needs 还原为 need。'],
 ['t09','be 动词','He is tired.','改成否定句','He is not tired.',["He isn't tired."],'含 be 动词的句子，直接在 is 后加 not。'],
 ['t10','be 动词','They are at home.','改成一般疑问句','Are they at home?',[],'将 are 移到主语 they 前面。'],
 ['t11','过去时','I go to the park every Sunday.','把 every Sunday 换成 last Sunday，改成过去时','I went to the park last Sunday.',[],'go 的过去式是不规则的 went。'],
 ['t12','过去否定','We watched a film last night.','改成否定句','We did not watch a film last night.',["We didn't watch a film last night."],'didn’t 后用 watch 原形。'],
 ['t13','一般疑问句','They played football yesterday.','改成一般疑问句','Did they play football yesterday?',[],'用 Did 提问过去的事情，played 变为 play。'],
 ['t14','be 动词','She was busy yesterday.','改成否定句','She was not busy yesterday.',["She wasn't busy yesterday."],'was 后直接加 not，不需要 didn’t。'],
 ['t15','否定句','I can swim.','改成否定句','I cannot swim.',["I can't swim.",'I can not swim.'],'can 的否定可用 cannot 或 can’t，swim 不变。'],
 ['t16','过去时','She has breakfast at seven every day.','把 every day 换成 yesterday，改成过去时','She had breakfast at seven yesterday.',[],'have / has 的过去式是 had。'],
 ['t17','一般疑问句','He can speak English.','改成一般疑问句','Can he speak English?',[],'情态动词 can 直接移到主语前面。'],
 ['t18','过去否定','I saw Anna this morning.','改成否定句','I did not see Anna this morning.',["I didn't see Anna this morning."],'didn’t 后用 see，不能用 saw。'],
 ['t19','否定句','They have a car.','用 do not 改成否定句','They do not have a car.',["They don't have a car."],'have 表示拥有，此题使用 don’t have。'],
 ['t20','be 动词','The books were on the desk.','改成一般疑问句','Were the books on the desk?',[],'将 were 移到主语 the books 前面。'],
 ['t21','过去时','I write a short message every morning.','把 every morning 换成 yesterday morning，改成过去时','I wrote a short message yesterday morning.',[],'write 的过去式是 wrote。'],
 ['t22','否定句','She likes coffee.','改成否定句','She does not like coffee.',["She doesn't like coffee."],'doesn’t 后用 like 原形。'],
 ['t23','一般疑问句','You were late yesterday.','改成一般疑问句','Were you late yesterday?',[],'含 were 的句子直接将 were 前移。'],
 ['t24','过去否定','He ate lunch at school.','改成否定句','He did not eat lunch at school.',["He didn't eat lunch at school."],'didn’t 后 ate 还原为 eat。']
].map(([id,topic,sentence,prompt,answer,alternatives,explanation])=>({id,topic,sentence,prompt,answer,alternatives,explanation}));
export const DIMENSIONS={recognize:'认识',listen:'听懂',spell:'拼对',use:'会用'};
