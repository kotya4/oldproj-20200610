#include <windows.h>
#include <time.h>
#include <iostream>


/*
void main(void)
{
	srand(15071992);

	for(int i=0; i<7; i++)
	{
		std::cout << rand() << std::endl;
	}

	std::cin.get();
}
*/




/*


void main(void)
{
	srand(time(NULL));


	std::cout << "             >>>>>>>>";
	Beep(400, 1000);
	Sleep(100);
	Beep(400, 200);
	Beep(400, 200);

	Sleep(800);

	std::cout << " 'Mu-";
	Beep(500, 1000);
	Sleep(100);
	Beep(500, 200);
	Beep(500, 200);

	Sleep(800);

	std::cout << "Mu-";
	Beep(600, 1000);
	Sleep(100);
	Beep(600, 200);
	Beep(600, 200);

	Sleep(800);

	std::cout << "Mu-";
	Beep(400, 1000);
	Sleep(100);
	Beep(500, 200);
	Beep(500, 200);

	Sleep(800);

	std::cout << "Music B0X'";
	Beep(400, 1000);
	Sleep(100);
	Beep(400, 200);
	Beep(400, 200);

	Sleep(800);

	std::cout << " by";
	Beep(300, 1000);
	Sleep(100);
	Beep(300, 200);
	Beep(300, 200);

	Sleep(800);

	std::cout << " Markus B. <<<<<<<< " << std::endl;
	Beep(400, 1000);
	Sleep(100);
	Beep(500, 200);
	Beep(500, 200);

	Sleep(800);
	
	std::cout << "              Music Name: Never borry" << std::endl;

	Beep(600, 1500);


	int temb = 0;
	int q=0, i=0, q_activator = 0, number = 100, dumber = 1;

	while(1)
	{
		for(q=0; q<6; q++)
		{
			if(q==3) q_activator = 100;
			else q_activator = 0;

			for(i=0; i<4; i++)
			{
				std::cout << "In #" << dumber;
				Beep(400+temb*100+i*q_activator, 300-2*number);
				std::cout << " I want";
				Beep(500+temb*100+i*q_activator, 300-2*number);
				std::cout << " you not to bored!";
				Beep(600+temb*100+i*q_activator, 300-2*number);
				std::cout << std::endl;

				number--;
				dumber++;
			}

			Sleep(400);

			std::cout << "Never, Irina!" << std::endl;
			Beep(300+ (rand() % 4 * 100), 1000);
			
			Sleep(200-2*number);

			temb = rand() % 8;

			if(q==5)
			{
				Beep(400, 300);
				std::cout << "Be";
				Beep(530, 600);
				std::cout << " bored";
				Sleep(100);
				Beep(450, 200);
				std::cout << " is";
				Beep(400, 500);
				Sleep(700);
				Beep(350, 200);
				std::cout << " not";
				Beep(400, 200);
				std::cout << " very";
				Beep(450, 200);
				std::cout << " intresting...";
				Beep(500, 200);
				Sleep(100);
				
				Beep(450, 300);
				Beep(400, 700);
				std::cout << std::endl << " Trust me, Irina :)" << std::endl;
				Sleep(100);
				Beep(350, 200);
				Beep(350, 600);
			}
		}
	}
}

*/


void main(void)
{
	srand(time(NULL));

	unsigned long int eve = -1;
	short time = 0;

	while(1)
	{
		for(int i=0; i<4; i++)
		{
			eve++;

			for(int q=0; q<4; q++)
			{
				system("cls");

				std::cout << "             >>>>>>>> 'Mu-Mu-Mu-Music B0X' by Markus B. <<<<<<<< " << std::endl;

				if(q == 0)
				{
					std::cout << "                ,,,,/, ,                             Cow Love " << std::endl;
					std::cout << "               | ---- `                     ._           __.  " << std::endl;
					std::cout << "               |/                          |  \\     _,_,-'' |      " << std::endl;
					std::cout << "               \\|                          |  -```````''/_ |       " << std::endl;
					std::cout << "                ||                         |             ||        " << std::endl;
					std::cout << "                ||                          |   _      _ .         " << std::endl;
					std::cout << "                ||                       __ |   " << eve << " /  \\ " << eve << " |" << std::endl;
					std::cout << "                |  .-..---------''````````_`'      _,,_  |         " << std::endl;
					std::cout << "                `\\\`   \\                     _    /    , |         " << std::endl;
					std::cout << "                  |   .-`     ,,,    ,        |   | O O| /         " << std::endl;
					std::cout << "                  |  |       |   \\-'` |       |_  \\,___||          " << std::endl;
					std::cout << "                  |-,/       \\        |         _|____/.           " << std::endl;
					std::cout << "                  |           ```/,,, '            .               " << std::endl;
					std::cout << "                  |                                |               " << std::endl;
					std::cout << "                  |     --             |    |      \\               " << std::endl;
					std::cout << "                  |    ,|,,,,          _    |` /   |                           " << std::endl;
					std::cout << "                  |     |    /`````````|    |  |   |                 |-`---`-.+" << std::endl;
					std::cout << "                  |     | _,'          |    |  |   `                 | '-- - '|" << std::endl;
					std::cout << "                  |,    `` |           |    |  |   |                 |        |" << std::endl;
					std::cout << "                   |    |  |           |    | \\|   |                 |        |" << std::endl;
					std::cout << "      ------------ |   |,__|           |    |  |   |                 ||" << std::endl;
					std::cout << "                   |___|                \\   |  |   |                 |        |" << std::endl;
					std::cout << "  --------------------- --------------- |   | \\|___|-----------------+,______,+";
				}
				
				else if(q == 1)
				{
					std::cout << "                ,,,,/, ,                             Cow Love " << std::endl;
					std::cout << "               | ---- `                    " << std::endl;
					std::cout << "               |/                                                   " << std::endl;
					std::cout << "               \\|                             ._           __.     " << std::endl;
					std::cout << "                ||                           |  \\     _,_,-'' |    " << std::endl;
					std::cout << "                ||                           |  -```````''/_ |     " << std::endl;
					std::cout << "                ||                       __  |             ||      " << std::endl;
					std::cout << "                |  .-..---------''````````_`' |   _      _ .       " << std::endl;
					std::cout << "                `\\\`   \\                      |   " << eve << " /  \\ " << eve << " |" << std::endl;
					std::cout << "                  |   .-`     ,,,    ,       `       _,,_  |       " << std::endl;
					std::cout << "                  |  |       |   \\-'` |        _    /    , |       " << std::endl;
					std::cout << "                  |-,/       \\        |         |   | O O| /       " << std::endl;
					std::cout << "                  |           ```/,,, '         |_  \\,___||        " << std::endl;
					std::cout << "                  |                               _|____/.         " << std::endl;
					std::cout << "                  |     --             |    |      |               " << std::endl;
					std::cout << "                  |    ,|,,,,          _    |` /   |                           " << std::endl;
					std::cout << "                  |     |    /`````````|    |  |   |                 |-`---`-.+" << std::endl;
					std::cout << "                  |     | _,'          |    |  |   `                 | '-- - '|" << std::endl;
					std::cout << "                  |,    `` |           |    |  |   |                 |        |" << std::endl;
					std::cout << "                   |    |  |           |    | \\|   |                 |        |" << std::endl;
					std::cout << "      ------------ |   |,__|           |    |  |   |                 ||" << std::endl;
					std::cout << "                   |___|                \\   |  |   |                 |        |" << std::endl;
					std::cout << "  --------------------- --------------- |   | \\|___|-----------------+,______,+";
				}
				
				else if(q == 2)
				{
					std::cout << "                ,,,,/, ,                             Cow Love " << std::endl;
					std::cout << "               | ---- `                    " << std::endl;
					std::cout << "               |/                         " << std::endl;
					std::cout << "               \\|                               " << std::endl;
					std::cout << "                ||                                     ,,_   " << std::endl;
					std::cout << "                ||                                   .`  | " << std::endl;
					std::cout << "                ||                        ..,,,_,/\\,/    | " << std::endl;
					std::cout << "                |  .-..---------''````````     _-  \\     \\ " << std::endl;
					std::cout << "                `\\`   \\                            \\     `," << std::endl;
					std::cout << "                  |   .-`     ,,,    ,                  ,  '," << std::endl;
					std::cout << "                  |  |       |   \\-'` |               " << eve << " |   " << eve << std::endl;
					std::cout << "                  |-,/       \\        |       .  `           \\   " << std::endl;
					std::cout << "                  |           ```/,,, '         \\         ,,,\\   " << std::endl;
					std::cout << "                  |                                      |    |  " << std::endl;
					std::cout << "                  |     --             |    |    -.     \\ Î  Î|  " << std::endl;
					std::cout << "                  |    ,|,,,,          _    |` /   |        , /                " << std::endl;
					std::cout << "                  |     |    /`````````|    |  |   | `````           |-`---`-.+" << std::endl;
					std::cout << "                  |     | _,'          |    |  |   `                 | '-- - '|" << std::endl;
					std::cout << "                  |,    `` |           |    |  |   |                 |        |" << std::endl;
					std::cout << "                   |    |  |           |    | \\|   |                 |        |" << std::endl;
					std::cout << "      ------------ |   |,__|           |    |  |   |                 ||" << std::endl;
					std::cout << "                   |___|                \\   |  |   |                 |        |" << std::endl;
					std::cout << "  --------------------- --------------- |   | \\|___|-----------------+,______,+";
				}

				else if(q == 3)
				{
					std::cout << "                ,,,,/, ,                             Cow Love " << std::endl;
					std::cout << "               | ---- `                    " << std::endl;
					std::cout << "               |/                          " << std::endl;
					std::cout << "               \\|                               " << std::endl;
					std::cout << "                ||                              " << std::endl;
					std::cout << "                ||                                                      " << std::endl;
					std::cout << "                ||                        .,,                           " << std::endl;
					std::cout << "                |  .-..---------''````````'  `\\.,                       " << std::endl;
					std::cout << "                `\\\`   \\                         '--                    " << std::endl;
					std::cout << "                  |   .-`     ,,,    ,             ``.     ,,_          " << std::endl;
					std::cout << "                  |  |       |   \\-'` |               `-,.`  |          " << std::endl;
					std::cout << "                  |-,/       \\        |       .     ,/\\,/    |          " << std::endl;
					std::cout << "                  |           ```/,,, '             -  \\     \\          " << std::endl;
					std::cout << "                  |                                     \\     `,        " << std::endl;
					std::cout << "                  |     --             |    |               ,  ',       " << std::endl;
					std::cout << "                  |     /,,,,          _    `''.,_        " << eve << " |   " << eve << std::endl;
					std::cout << "                  |     |    /`````````|    `````\\,, `           \\   |-`---`-.+" << std::endl;
					std::cout << "                  |     | _,'          |    |  |   `\\         ,,,\\   | '-- - '|" << std::endl;
					std::cout << "                  |,    `` |           |    |  |   | \\       |    |  |        |" << std::endl;
					std::cout << "                   |    |  |           |    | \\|   | \\.     \\ Î  Î|  |        |" << std::endl;
					std::cout << "      ------------ |   |,__|           |    |  |   |   '.,_     , /  ||" << std::endl;
					std::cout << "                   |___|                \\   |  |   |     `````       |        |" << std::endl;
					std::cout << "  --------------------- --------------- |   | \\|___|-----------------+,______,+";
				}


				Beep(500+100*i+time*6, 100);
				Sleep(200+time*2);
		
				Beep(500+100*i+time*6, 100);
				Sleep(200+time*2);


				for(int w=1; w<4; w++)
				{
					Beep(300*w+time*3, 80);
					Sleep(80+time/2);
				}

				Sleep(50+time/2);
			}


			if(eve == 666)
			{
				time = -50;
			}
		}

	}


	return;

}
*/


	/*
	for(unsigned int q=0; q < 18; q++)
	{
		std::cout << " " << q+1 << " cow ate my cake." << std::endl;

		int temb, temb1, temb2, time = 120, time2 = 86;
		
		temb = rand() % 5 + 5;


		temb1 = temb;
		temb2 = temb;


		if(q > 3)
		{
			temb2 = rand() % 5 + 5;
		}
		
		if(q > 7)
		{
			temb1 = rand() % 5 + 5;
		}

		if(q > 11)
		{
			time = rand() % 50 + 100;
		}
		
		if(q > 15)
		{
			time2 = rand() % 50 + 50;
		}


		Beep(100*temb, time);
		Sleep(400);
		
		Beep(100*temb1, time);
		Sleep(400);


		for(int i=0; i<4; i++)
		{
			Beep(100*temb2, time2);
			Sleep(80);
		}

		Sleep(400);
	}
	

	std::cout << std::endl << " I KILLED ALL COWS!!! " << std::endl;

	for(int i = 10; i > 0; i--)
	{
		Beep(100*i, 150);
		Beep(150*i, 150);

		Sleep(150);
	}

	Beep(600, 500);
	
	std::cout << std::endl << " :) ";

	Sleep(500);
	
	Beep(400, 150);
}

void main(void)
{
	srand(time(NULL));

	unsigned short ton = 500;
	unsigned short timer = 500;

	std::cout << " Markus Black.       ======= Musical Box ==========" << std::endl;

	while(1)
	{
		if((rand() % 2) == 0)
		{
			if(ton < 1000) ton+=50;
		}
		else
		{
			if(ton > 100) ton-=50;
		}

		timer = rand() % 170 +100;
		
		Beep(ton, timer);
	}
}