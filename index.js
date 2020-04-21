const VERTICALS_URL = 'https://public-api.wordpress.com/wpcom/v2/verticals/m1/templates';

const fetch = require( 'node-fetch' );
const { parse } = require( '@wordpress/block-serialization-default-parser' );

const getTemplates = async () => {
    const data = await fetch( VERTICALS_URL );
    return data.json();
};

const countBlockStats = ( results, template, block ) => {
    const { blockName, innerBlocks } = block;
    let { templatesCount, totalCount } = results;
    if ( blockName == null ) {
        return results;
    }
    templatesCount[blockName] = templatesCount[blockName] ? templatesCount[blockName].add(template) : new Set([template]);
    totalCount[blockName] = totalCount[blockName] ? totalCount[blockName] + 1 : 1;
    if ( ! innerBlocks ) {
        console.log(block);
    }
    return innerBlocks.reduce( (result, innerBlock) => {
        return countBlockStats( result, template, innerBlock );
    }, {
        templatesCount,
        totalCount,
    });
}

function traverse( block, actionToPerform ) {
    actionToPerform( block );
    block.innerBlocks.forEach( (blockIter) => {
        traverse( blockIter, actionToPerform )
    })
}

function traverseAll( blocksArrray, actionToPerform ) {
    blocksArrray.forEach( (block) => {
        traverse(block, actionToPerform)
    })
}

const run = async () => {
    const { templates } = await getTemplates();
    const filteredTemplates = templates;//.filter( template => template.slug.includes('portfolio') );// template.slug === 'blog' || template.slug === 'professional' ||

  //  console.log(filteredTemplates)
    const supportedBlocks = [
        'core/paragraph',
        'core/heading',
        'core/missing',
        'core/more',
        'core/image',
        'core/video',
        'core/nextpage',
        'core/separator',
        'core/list',
        'core/quote',
        'core/media-text',
        'core/preformatted',
        'core/gallery',
        'core/columns',
        'core/column',
        'core/group',
        'core/button',
        'core/spacer',
        'core/shortcode',
        'core/latest-posts',
        'core/cover',
        'core/buttons'
    ]

    function onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
    }

    console.log(`Template, unsupported block list, unsupported block count`);

    filteredTemplates.forEach( (template, index, arr) => {
        const blocks = parse( template.content );
        const unsupportedBlocks = []

        traverseAll( blocks, ( block ) => {
            if ( ! supportedBlocks.includes( block.blockName ) ) {
                unsupportedBlocks.push( block.blockName );
            }

        })

      const cleanList = unsupportedBlocks.filter(String).filter( (e) =>{ return e != null } ).filter( onlyUnique );
      console.log(`${ template.slug }, ${ cleanList.join( ' | ' ) }, ${ cleanList.length }`);
    });

 /*   const stats = filteredTemplates.reduce( (result, template) => {

        const blocks = parse( template.content );
        return blocks.reduce(
            ( result, block ) => countBlockStats( result, template.slug, block ),
            result
        );
    }, {
        templatesCount: {},
        totalCount: {},
    })

    const allBlocks = Object.keys(stats.totalCount);
    const summary = allBlocks.reduce( ( result, block ) => {
        result[block] = {
            filteredTemplates: stats.templatesCount[block].size / filteredTemplates.length,
            total: stats.totalCount[block],
        };
        return result;
    }, {})
    console.log('block,templates,totalCount')
    allBlocks.forEach( (block) => {
        const templateCount = stats.templatesCount[block].size / filteredTemplates.length;
        const total = stats.totalCount[block];
        console.log(`${block},${templateCount},${total}`);
    });*/
}

run();
// console.log(parse('<!-- wp:paragraph {"align":"left","fontSize":"small"} -->\n<p style="text-align:left;" class="has-small-font-size">We ❤️ our business. And we 💗 doing business with you. Great service, with a personal touch. That\'s our commitment.</p>\n<!-- /wp:paragraph -->'));
