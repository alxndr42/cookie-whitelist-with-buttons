xpi: clean
	zip -r cwwb.xpi content defaults locale skin LICENSE chrome.manifest icon.png icon64.png install.rdf

clean:
	rm -f cwwb.xpi
