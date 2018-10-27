OBJDir = object

.PHONY : all
all:
	mkdir -p $(OBJDir)
	cd $(OBJDir) && cmake ../
	cd $(OBJDir) && make
	
clean:
	rm -f *.o *.app
	rm -rf object
  
