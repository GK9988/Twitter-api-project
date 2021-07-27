const url = "https://twitter-api-project-1101.herokuapp.com";

const URL = `${url}/tweets`;

let nextPageUrl = null;

const onEnter = (e) => {
  if (e.key == "Enter") {
    getTwitterData();
  }
};

const onNextPage = () => {
  if (nextPageUrl) {
    getTwitterData(true);
  }
};

/**
 * Retrive Twitter Data from API
 */
const getTwitterData = (nextPage = false) => {
  const searchQuery = document.getElementById("user-search-input").value;

  const encodedQuery = encodeURIComponent(searchQuery);

  let resultURL = `${URL}?q=${encodedQuery}&count=10`;

  if (nextPage && nextPageUrl) {
    resultURL = nextPageUrl;
  }

  if (!searchQuery) return;

  fetch(resultURL)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      buildTweets(data.statuses, nextPage);
      saveNextPage(data.search_metadata);
      nextPageButtonVisibility(data.search_metadata);
    });
};

/**
 * Save the next page data
 */
const saveNextPage = (metadata) => {
  if (metadata.next_results) {
    nextPageUrl = `${URL}${metadata.next_results}`;
  } else {
    nextPageUrl = null;
  }
};

/**
 * Handle when a user clicks on a trend
 */
const selectTrend = (trend) => {
  const trendText = trend.innerText;

  document.getElementById("user-search-input").value = trendText;

  getTwitterData();
};

/**
 * Set the visibility of next page based on if there is data on next page
 */
const nextPageButtonVisibility = (metadata) => {
  const nextPageButton = document.getElementById("next-page-container");
  if (metadata.next_results) {
    nextPageButton.style.display = "flex";
  } else {
    nextPageButton.style.display = "none";
  }
};

/**
 * Build Tweets HTML based on Data from API
 */
const buildTweets = (tweetsList, nextPageBool) => {
  let tweetListHtml = "";

  tweetsList.map((tweet) => {
    const createdDate = moment(tweet.created_at).fromNow();

    tweetListHtml += `
        <div class="tweet-container">
            <div class="tweet-user-info">
                <div class="tweet-user-profile" style="background-image: url(${tweet.user.profile_image_url_https}) ;"></div>
                <div class="tweet-user-name-container">
                    <div class="tweet-user-fullname">${tweet.user.name}</div>
                    <div class="tweet-user-username">@${tweet.user.screen_name}</div>
                </div>
            </div>`;

    if (tweet.extended_entities && tweet.extended_entities.media.length > 0) {
      tweetListHtml += buildImages(tweet.extended_entities.media);
      tweetListHtml += buildVideo(tweet.extended_entities.media);
    }

    tweetListHtml += `
            <div class="tweet-text-container">
            ${tweet.full_text}
            </div>
            <div class="tweet-date-container">${createdDate}</div>
        </div>
        `;
  });

  if (nextPageBool) {
    document
      .querySelector(".tweets-list")
      .insertAdjacentHTML("beforeend", tweetListHtml);
  } else {
    document.querySelector(".tweets-list").innerHTML = tweetListHtml;
  }
};

/**
 * Build HTML for Tweets Images
 */
const buildImages = (mediaList) => {
  let imageExists = false;
  let imagesContent = `<div class="tweet-images-container">`;
  mediaList.map((media) => {
    if (media.type == "photo") {
      imageExists = true;
      imagesContent += `<div class="tweet-image" style="background-image: url(${media.media_url_https});"></div>`;
    }
  });

  imagesContent += `</div>`;

  return imageExists ? imagesContent : "";
};

/**
 * Build HTML for Tweets Video
 */
const buildVideo = (mediaList) => {
  let videoExists = false;
  let videosContent = `<div class="tweet-video-container">`;
  mediaList.map((media) => {
    if (media.type == "video") {
      videoExists = true;
      const videoVariant = media.video_info.variants.find(
        (variant) => variant.content_type == "video/mp4"
      );
      videosContent += `
                <video controls>
                    <source src="${videoVariant.url}" type="video/mp4">
                </video>
            `;
    } else if (media.type == "animated_gif") {
      videoExists = true;
      const gifVariant = media.video_info.variants.find(
        (variant) => variant.content_type == "video/mp4"
      );
      videosContent += `
                <video loop autoplay>
                    <source src="${gifVariant.url}" type="video/mp4">
                </video>
            `;
    }
  });

  videosContent += `</div>`;

  return videoExists ? videosContent : "";
};
